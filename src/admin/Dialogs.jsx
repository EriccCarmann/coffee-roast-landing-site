import { useEffect, useId, useRef, useState } from 'react';
import { ORDER_OPTIONS } from '../data/products.js';
import { SOURCES } from '../data/sources.js';
import { LIMITS, fieldError, phoneIsValid } from './labels.js';

// Native <dialog>: the browser traps focus, blocks the page behind it, and a second dialog opened on top
// (the "are you sure?" over the edit form) stacks correctly. Escape closes only the top one.
function Modal({ onCancel, labelledBy, className = '', role, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const d = ref.current;
    if (!d.open) d.showModal();
    return () => { if (d.open) d.close(); };
  }, []);
  return (
    <dialog ref={ref} className={`modal ${className}`} role={role} aria-labelledby={labelledBy}
      onCancel={(e) => { e.preventDefault(); onCancel(); }}>
      {children}
    </dialog>
  );
}

// Cancel comes first in the DOM, so it gets the focus: Enter/Space can never confirm by accident.
export function ConfirmDialog({ title, children, danger = false, busy = false, onConfirm, onCancel }) {
  const id = useId();
  return (
    <Modal onCancel={busy ? () => {} : onCancel} labelledBy={id} className="modal--confirm" role="alertdialog">
      <h2 id={id} className="modal__title">{title}</h2>
      <div className="modal__body">{children}</div>
      <div className="modal__actions">
        <button type="button" className="btn" onClick={onCancel} disabled={busy}>Cancel</button>
        <button type="button" className={`btn ${danger ? 'btn--danger' : 'btn--primary'}`} onClick={onConfirm} disabled={busy}>OK</button>
      </div>
    </Modal>
  );
}

// Add (mode "add") and edit (mode "edit") share this form.
// Edit: OK -> "Are you sure?" -> OK saves; Cancel goes back here with every change still in the fields.
export function OrderFormDialog({ mode, order, onSave, onClose }) {
  const titleId = useId();
  const [v, setV] = useState(() => ({
    name: order?.name ?? '', phone: order?.phone ?? '', order_type: order?.order_type ?? '',
    heard_from: order?.heard_from ?? '', comment: order?.comment ?? '',
  }));
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setV((x) => ({ ...x, [k]: e.target.value }));

  const sources = SOURCES.map((s) => s.value);
  if (v.heard_from && !sources.includes(v.heard_from)) sources.push(v.heard_from); // keep an old/unknown value selectable

  function validate() {
    const errs = {};
    if (!phoneIsValid(v.phone)) errs.phone = fieldError('phone', 'invalid');
    for (const [k, max] of Object.entries(LIMITS)) if (!errs[k] && v[k].trim().length > max) errs[k] = fieldError(k, 'too_long');
    return errs;
  }

  async function submit() {
    setSaving(true);
    setFormError('');
    try {
      await onSave(v); // on success the parent closes this dialog
    } catch (err) {
      setConfirming(false);
      setSaving(false);
      const fromServer = err.body?.errors;
      if (fromServer) setErrors(Object.fromEntries(Object.entries(fromServer).map(([k, c]) => [k, fieldError(k, c)])));
      else setFormError(err.status === 404 ? 'This order no longer exists. Close this window and refresh.' : 'Could not save. Please try again.');
    }
  }

  function onOk(e) {
    e.preventDefault();
    if (saving) return;
    const errs = validate();
    setErrors(errs);
    setFormError('');
    if (Object.keys(errs).length) return;
    if (mode === 'edit') setConfirming(true);
    else submit();
  }

  return (
    <>
      <Modal onCancel={saving ? () => {} : onClose} labelledBy={titleId} className="modal--form">
        <form onSubmit={onOk} noValidate>
          <h2 id={titleId} className="modal__title">{mode === 'edit' ? `Edit order #${order.id}` : 'Add order'}</h2>
          <div className="modal__body fields">
            <label className="field">
              <span>Name</span>
              <input value={v.name} onChange={set('name')} maxLength={LIMITS.name + 20} autoComplete="off" aria-invalid={Boolean(errors.name)} />
              {errors.name && <em className="field__error">{errors.name}</em>}
            </label>
            <label className="field">
              <span>Phone <b aria-hidden="true">*</b></span>
              <input value={v.phone} onChange={set('phone')} inputMode="tel" placeholder="+375 (29) 123 45 67" autoComplete="off"
                aria-invalid={Boolean(errors.phone)} aria-required="true" />
              {errors.phone && <em className="field__error">{errors.phone}</em>}
            </label>
            <label className="field">
              <span>Order</span>
              <input value={v.order_type} onChange={set('order_type')} list="order-suggestions" autoComplete="off" aria-invalid={Boolean(errors.order_type)} />
              <datalist id="order-suggestions">
                {ORDER_OPTIONS.map((o) => <option key={o.key} value={o.value} />)}
              </datalist>
              {errors.order_type && <em className="field__error">{errors.order_type}</em>}
            </label>
            <label className="field">
              <span>Where did they hear about us?</span>
              <select value={v.heard_from} onChange={set('heard_from')}>
                <option value="">—</option>
                {sources.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <label className="field">
              <span>Comment</span>
              <textarea value={v.comment} onChange={set('comment')} rows={4} aria-invalid={Boolean(errors.comment)} />
              {errors.comment && <em className="field__error">{errors.comment}</em>}
            </label>
            {formError && <p className="form-error" role="alert">{formError}</p>}
          </div>
          <div className="modal__actions">
            <button type="button" className="btn" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="btn btn--primary" disabled={saving}>OK</button>
          </div>
        </form>
      </Modal>
      {confirming && (
        <ConfirmDialog title="Are you sure?" busy={saving} onConfirm={submit} onCancel={() => setConfirming(false)}>
          <p>Save the changes to order #{order.id}?</p>
        </ConfirmDialog>
      )}
    </>
  );
}
