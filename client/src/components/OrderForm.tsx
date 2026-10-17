'use client';

import { useEffect, useRef } from 'react';
import { useI18n } from '../i18n';
import { useOrder } from '../context/OrderContext';
import useOrderForm from '../hooks/useOrderForm';
import type { FormStatus } from '../hooks/useOrderForm';
import { PRODUCTS, SUBSCRIPTION } from '../data/products';
import type { OrderType } from '../data/products';
import Button from './Button';
import Rich from './Rich';

export default function OrderForm() {
  const { t } = useI18n();
  const { orderType, setOrderType, focusTick } = useOrder();
  const { values, errors, status, info, setField, submit, reset } = useOrderForm();

  const phoneRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const sending = status === 'sending';
  const done = status === 'success';

  // A product button elsewhere on the page was clicked: focus the phone field after the scroll.
  useEffect(() => {
    if (focusTick === 0) return undefined;
    const id = setTimeout(() => phoneRef.current?.focus({ preventScroll: true }), 420);
    return () => clearTimeout(id);
  }, [focusTick]);

  // Bring the status panel into view when it appears.
  useEffect(() => {
    if (status !== 'idle' && status !== 'sending') {
      panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [status]);

  const optionLabel = (p: (typeof PRODUCTS)[number]) => {
    const name = t(`products.items.${p.id}.name`);
    const suffix = p.id === SUBSCRIPTION.id ? ` ${t('subscription.per')}` : '';
    return `${name} — ${p.price} BYN${suffix}`;
  };

  const phoneInfo = { phone: info.phone, time: info.time };
  // Partial: 'idle' and 'sending' have no panel, so indexing may give undefined.
  const panels: Partial<Record<FormStatus, { cls: string; text: string; role: 'status' | 'alert' }>> = {
    success: { cls: 'success', text: t('form.success', phoneInfo), role: 'status' },
    duplicate: { cls: 'info', text: t('form.duplicate', phoneInfo), role: 'status' },
    error: { cls: 'error', text: t('form.error'), role: 'alert' },
    tooMany: { cls: 'error', text: t('form.tooMany'), role: 'alert' },
  };
  const panel = panels[status];

  return (
    <form className="form" onSubmit={submit} noValidate>
      <div ref={panelRef}>
        {panel && (
          <div className={`form__panel form__panel--${panel.cls}`} role={panel.role}>
            <Rich text={panel.text} />
            {done && (
              <div>
                <button type="button" className="form__again" onClick={reset}>
                  {t('form.again')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div hidden={done}>
        <p className="form__title">{t('form.title')}</p>
        <p className="form__sub">{t('form.sub')}</p>

        <div className="field">
          <label className="field__label" htmlFor="f-order">
            {t('form.orderLabel')}
          </label>
          <select
            id="f-order"
            className="field__control"
            value={orderType}
            onChange={(e) => setOrderType(e.target.value as OrderType)}
          >
            <option value="one-time">{t('form.oneTime')}</option>
            {PRODUCTS.map((p) => (
              <option key={p.id} value={p.id}>
                {optionLabel(p)}
              </option>
            ))}
            <option value="advice">{t('form.advice')}</option>
          </select>
        </div>

        <div className="field">
          <label className="field__label" htmlFor="f-name">
            {t('form.nameLabel')}
          </label>
          <input
            id="f-name"
            className="field__control"
            type="text"
            name="name"
            autoComplete="name"
            maxLength={60}
            placeholder={t('form.namePh')}
            value={values.name}
            onChange={(e) => setField('name', e.target.value)}
          />
        </div>

        <div className="field">
          <label className="field__label" htmlFor="f-phone">
            {t('form.phoneLabel')} <span className="field__req">*</span>
          </label>
          <input
            id="f-phone"
            ref={phoneRef}
            className="field__control"
            type="tel"
            name="phone"
            inputMode="tel"
            autoComplete="tel"
            placeholder={t('form.phonePh')}
            value={values.phone}
            onChange={(e) => setField('phone', e.target.value)}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? 'f-phone-err' : undefined}
          />
          {errors.phone && (
            <div id="f-phone-err" className="field__error">
              {t(`form.errors.${errors.phone}`)}
            </div>
          )}
        </div>

        <div className="field">
          <label className="field__label" htmlFor="f-comment">
            {t('form.commentLabel')}
          </label>
          <textarea
            id="f-comment"
            className="field__control field__control--area"
            name="comment"
            maxLength={300}
            placeholder={t('form.commentPh')}
            value={values.comment}
            onChange={(e) => setField('comment', e.target.value)}
          />
        </div>

        {/* Honeypot: hidden from humans, bots fill it. The server silently drops those. */}
        <input
          type="text"
          name="website"
          className="hp"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          value={values.website}
          onChange={(e) => setField('website', e.target.value)}
        />

        <div className="check">
          <input
            id="f-agreement"
            type="checkbox"
            checked={values.agreement}
            onChange={(e) => setField('agreement', e.target.checked)}
            aria-invalid={Boolean(errors.agreement)}
          />
          <label htmlFor="f-agreement">{t('form.agreement')}</label>
          {errors.agreement && (
            <div className="field__error check__error">{t(`form.errors.${errors.agreement}`)}</div>
          )}
        </div>

        <Button type="submit" className="form__submit" disabled={sending}>
          {sending ? t('form.sending') : t('form.submit')}
        </Button>
        <p className="form__small">
          <Rich text={t('form.small')} />
        </p>
      </div>
    </form>
  );
}
