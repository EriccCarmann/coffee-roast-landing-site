import { useEffect, useRef, useState } from 'react';
import { useLang } from '../language/LangContext.jsx';
import T from '../language/T.jsx';
import Button from './Button.jsx';
import { ICONS } from '../data/images.js';
import { ORDER_OPTIONS, PHONE, PHONE_HREF } from '../data/products.js';
import { PHONE_RE } from '../data/constants.js';
import { SOURCES } from '../data/sources.js';

const COOLDOWN_MS = 10 * 60 * 1000;
const SEND_TIMEOUT_MS = 15000;
const FORM_NAME = 'Заявка с лендинга «Кварта»';
const UTM_FIELDS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid'];

const digitsOf = (v) => String(v || '').replace(/\D/g, '');
const pad = (n) => (n < 10 ? '0' : '') + n;
const formatTime = (ts) => { const d = new Date(ts); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };

// Where the visitor came from: UTM tags, Google Ads click id, referrer and landing URL.
function getAttribution() {
  const params = new URLSearchParams(window.location.search);
  const out = {};
  for (const key of UTM_FIELDS) out[key] = params.get(key) || '';
  out.referrer = document.referrer || '';
  out.landing_page = window.location.href || '';
  return out;
}

export default function OrderForm({ order, onOrderChange, focusSignal }) {
  const { t } = useLang();
  const rootRef = useRef(null);
  const phoneRef = useRef(null);
  const panelRef = useRef(null);
  const sentPhones = useRef({}); // { 'phone digits': time sent }

  const [fields, setFields] = useState({ name: '', phone: '', comment: '', agreement: false });
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false); // request sent: fields are hidden
  const [panel, setPanel] = useState(null); // { type: 'success' | 'duplicate' | 'error', phone, sentAt }

  // "Leave a request" clicked in another section: option picked -> scroll to the form -> focus the phone field.
  useEffect(() => {
    if (!focusSignal) return;
    rootRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (done) return;
    const id = setTimeout(() => phoneRef.current?.focus(), 420);
    return () => clearTimeout(id);
  }, [focusSignal]);

  useEffect(() => {
    if (!panel) return;
    if (panel.type === 'success') rootRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    else panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [panel]);

  const setField = (name) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFields((f) => ({ ...f, [name]: value }));
    setErrors((errs) => ({ ...errs, [name]: undefined }));
  };

  function validate() {
    const errs = {};
    const len = digitsOf(fields.phone).length;
    if (len === 0) errs.phone = 'emptyPhone';
    else if (!PHONE_RE.test(fields.phone)) errs.phone = 'invalidPhone';
    if (!fields.agreement) errs.agreement = 'errAgree';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (sending) return;
    setPanel(null);

    const errs = validate();
    setErrors(errs);
    if (errs.phone || errs.agreement) return;

    const now = Date.now();
    for (const key of Object.keys(sentPhones.current)) {
      if (now - sentPhones.current[key] >= COOLDOWN_MS) delete sentPhones.current[key];
    }
    const key = digitsOf(fields.phone);
    if (key && sentPhones.current[key]) {
      setPanel({ type: 'duplicate', phone: fields.phone, sentAt: sentPhones.current[key] });
      return;
    }

    sentPhones.current[key] = now;
    setSending(true);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), SEND_TIMEOUT_MS);
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          form_name: FORM_NAME,
          order_type: order,
          name: fields.name,
          phone: fields.phone,
          comment: fields.comment,
          heard_from: fields.source,
          agreement: 'yes',
          ...getAttribution(),
        }),
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setDone(true);
      setPanel({ type: 'success', phone: fields.phone });
    } catch {
      delete sentPhones.current[key]; // not sent: allow a retry
      setPanel({ type: 'error' });
    } finally {
      clearTimeout(timer);
      setSending(false);
    }
  }

  const fieldError = (name) => (errors[name] ? t(`order.${errors[name]}`) : '');

  return (
      <section id="vb-r8n" className="vb-r8n" aria-labelledby="vb-r8n-title" ref={rootRef}>
        <div className="vb-r8n__inner">
          <div>
            <h2 id="vb-r8n-title" className="vb-r8n__title"><T k="order.title" /></h2>
            <p className="vb-r8n__lead"><T k="order.lead" /></p>
            <ul className="vb-r8n__contacts">
              <li className="vb-r8n__contact">
                <div className="vb-r8n__cicon"><img src={ICONS.phone_contact_call} alt="" aria-hidden="true" /></div>
                <div>
                  <p className="vb-r8n__clabel"><T k="order.cl1" /></p>
                  <p className="vb-r8n__cvalue"><a href={PHONE_HREF}>{PHONE}</a></p>
                  <p className="vb-r8n__cnote"><T k="order.cn1" /></p>
                </div>
              </li>
              <li className="vb-r8n__contact">
                <div className="vb-r8n__cicon"><img src={ICONS.coffee_machine_drink} alt="" aria-hidden="true" /></div>
                <div>
                  <p className="vb-r8n__clabel"><T k="order.cl2" /></p>
                  <p className="vb-r8n__cvalue"><T k="order.cv2" /></p>
                  <p className="vb-r8n__cnote"><T k="order.cn2" /></p>
                </div>
              </li>
              <li className="vb-r8n__contact">
                <div className="vb-r8n__cicon"><img src={ICONS.map_way_mark_where_adress} alt="" aria-hidden="true" /></div>
                <div>
                  <p className="vb-r8n__clabel"><T k="order.cl3" /></p>
                  <p className="vb-r8n__cvalue"><T k="order.cv3" /></p>
                  <p className="vb-r8n__cnote"><T k="order.cn3" /></p>
                </div>
              </li>
            </ul>
          </div>

          <form className="vb-r8n-form" name="vb-r8n-form" noValidate onSubmit={handleSubmit}>
            {panel?.type === 'success' && (
                <div className="vb-r8n__panel vb-r8n__panel--success" role="status" ref={panelRef}>
                  <T k="order.succ1" /> <strong>{panel.phone}</strong> <T k="order.succ2" />
                </div>
            )}
            {panel?.type === 'duplicate' && (
                <div className="vb-r8n__panel vb-r8n__panel--info" role="status" ref={panelRef}>
                  {t('order.dupA')}<strong>{panel.phone}</strong>{t('order.dupB', { time: formatTime(panel.sentAt) })}
                </div>
            )}
            {panel?.type === 'error' && (
                <div className="vb-r8n__panel vb-r8n__panel--error" role="alert" ref={panelRef}>
                  <T k="order.err" />
                </div>
            )}

            {!done && (
                <div>
                  <p className="vb-r8n__formtitle"><T k="order.ftitle" /></p>
                  <p className="vb-r8n__formsub"><T k="order.fsub" /></p>

                  <div className="vb-r8n-field">
                    <label className="vb-r8n__label" htmlFor="vb-r8n-order"><T k="order.lorder" /></label>
                    <select
                        id="vb-r8n-order"
                        name="order_type"
                        className="vb-r8n__select"
                        value={order}
                        onChange={(e) => onOrderChange(e.target.value)}
                    >
                      {ORDER_OPTIONS.map((o) => (
                          <option key={o.key} value={o.value}>
                            {t(`order.${o.key}`, o.price ? { price: o.price } : undefined)}
                          </option>
                      ))}
                    </select>
                    <div className="t-input-error" />
                  </div>

                  <div className="vb-r8n-field">
                    <label className="vb-r8n__label" htmlFor="vb-r8n-name"><T k="order.lname" /></label>
                    <input
                        id="vb-r8n-name"
                        type="text"
                        name="name"
                        className="vb-r8n__input"
                        placeholder={t('order.phname')}
                        autoComplete="name"
                        maxLength={60}
                        value={fields.name}
                        onChange={setField('name')}
                    />
                    <div className="t-input-error" />
                  </div>

                  <div className="vb-r8n-field">
                    <label className="vb-r8n__label" htmlFor="vb-r8n-phone">
                      <T k="order.lphone" /> <span className="vb-r8n__req">*</span>
                    </label>
                    <input
                        id="vb-r8n-phone"
                        type="tel"
                        name="phone"
                        className="vb-r8n__input"
                        placeholder="+375 (29) 345-67-89"
                        autoComplete="tel"
                        inputMode="tel"
                        ref={phoneRef}
                        value={fields.phone}
                        onChange={setField('phone')}
                        aria-invalid={Boolean(errors.phone)}
                        aria-describedby="vb-r8n-phone-error"
                    />
                    <div className="t-input-error" id="vb-r8n-phone-error">{fieldError('phone')}</div>
                  </div>

                  <div className="vb-r8n-field">
                    <label className="vb-r8n__label" htmlFor="vb-r8n-source"><T k="order.lsource" /></label>
                    <select
                        id="vb-r8n-source"
                        name="heard_from"
                        className="vb-r8n__select"
                        value={fields.source}
                        onChange={setField('source')}
                    >
                      <option value="">{t('order.sourcePh')}</option>
                      {SOURCES.map((s) => (
                          <option key={s.key} value={s.value}>{t(`order.${s.key}`)}</option>
                      ))}
                    </select>
                    <div className="t-input-error" />
                  </div>

                  <div className="vb-r8n-field">
                    <label className="vb-r8n__label" htmlFor="vb-r8n-comment"><T k="order.lcomment" /></label>
                    <textarea
                        id="vb-r8n-comment"
                        name="comment"
                        className="vb-r8n__textarea"
                        placeholder={t('order.phcomment')}
                        maxLength={300}
                        value={fields.comment}
                        onChange={setField('comment')}
                    />
                    <div className="t-input-error" />
                  </div>

                  <div className="vb-r8n__check">
                    <input
                        id="vb-r8n-agreement"
                        type="checkbox"
                        name="agreement"
                        checked={fields.agreement}
                        onChange={setField('agreement')}
                        aria-invalid={Boolean(errors.agreement)}
                        aria-describedby="vb-r8n-agreement-error"
                    />
                    <label className="vb-r8n__checklabel" htmlFor="vb-r8n-agreement"><T k="order.check" /></label>
                    <div className="t-input-error" id="vb-r8n-agreement-error" style={{ gridColumn: '1 / -1' }}>
                      {fieldError('agreement')}
                    </div>
                  </div>
                </div>
            )}

            <Button as="button" type="submit" className="t-submit vb-r8n__submit" disabled={sending}>
              {t(sending ? 'order.sending' : 'order.submit')}
            </Button>
            <p className="vb-r8n__small"><T k="order.small" /></p>
          </form>
        </div>
      </section>
  );
}