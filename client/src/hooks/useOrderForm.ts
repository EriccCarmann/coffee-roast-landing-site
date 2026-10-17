'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useI18n } from '../i18n';
import { useOrder } from '../context/OrderContext';
import { getAttribution } from '../lib/attribution';

const COOLDOWN_MS = 10 * 60 * 1000; // same phone can't be submitted again for 10 min
const SEND_TIMEOUT_MS = 15_000; // give up on the request after 15 s

export type FormValues = {
  name: string;
  phone: string;
  comment: string;
  agreement: boolean;
  website: string; // honeypot
};
export type FieldErrors = Partial<Record<'phone' | 'agreement', 'phoneRequired' | 'phoneInvalid' | 'agreementRequired'>>;
export type FormStatus = 'idle' | 'sending' | 'success' | 'duplicate' | 'error' | 'tooMany';

const EMPTY: FormValues = { name: '', phone: '', comment: '', agreement: false, website: '' };

const digitsOf = (value: string): string => value.replace(/\D/g, '');

const formatTime = (ts: number): string => {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

function validate(values: FormValues): FieldErrors {
  const errors: FieldErrors = {};
  const digits = digitsOf(values.phone);
  if (!values.phone.trim()) errors.phone = 'phoneRequired';
  else if (digits.length < 9 || digits.length > 15) errors.phone = 'phoneInvalid';
  if (!values.agreement) errors.agreement = 'agreementRequired';
  return errors;
}

/**
 * All the form logic. The component only renders what this returns.
 */
export default function useOrderForm() {
  const { lang } = useI18n();
  const { orderType, focusTick } = useOrder();

  const [values, setValues] = useState<FormValues>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<FormStatus>('idle');
  const [info, setInfo] = useState({ phone: '', time: '' });

  // phone digits -> timestamp of the last successful send (client-side duplicate guard)
  const sentPhones = useRef(new Map<string, number>());

  // K extends keyof FormValues makes `value` match the field: setField('agreement', 'x') won't compile.
  const setField = useCallback(<K extends keyof FormValues>(name: K, value: FormValues[K]) => {
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((e) => (name in e ? { ...e, [name]: undefined } : e)); // clear that field's error
  }, []);

  const reset = useCallback(() => {
    setValues(EMPTY);
    setErrors({});
    setStatus('idle');
  }, []);

  // Picking a product after a successful send starts a fresh form.
  useEffect(() => {
    if (focusTick > 0) setStatus((s) => (s === 'success' ? 'idle' : s));
  }, [focusTick]);

  const submit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (status === 'sending') return;

      const found = validate(values);
      setErrors(found);
      if (Object.keys(found).length > 0) return;

      const key = digitsOf(values.phone);
      const now = Date.now();
      const previous = sentPhones.current.get(key);
      if (previous && now - previous < COOLDOWN_MS) {
        setInfo({ phone: values.phone, time: formatTime(previous) });
        setStatus('duplicate');
        return;
      }

      // Mark as sent BEFORE the request so a double-click can't send twice.
      sentPhones.current.set(key, now);
      setStatus('sending');

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), SEND_TIMEOUT_MS);

      try {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            orderType,
            name: values.name.trim(),
            phone: values.phone.trim(),
            comment: values.comment.trim(),
            agreement: values.agreement,
            website: values.website, // honeypot: real users leave it empty
            lang,
            attribution: getAttribution(),
          }),
        });

        if (res.status === 409) {
          // The server also remembers recent phones (covers reloads / other tabs).
          const data = (await res.json().catch(() => ({}))) as { sentAt?: number };
          setInfo({ phone: values.phone, time: formatTime(data.sentAt ?? now) });
          setStatus('duplicate');
          return;
        }
        if (res.status === 429) {
          sentPhones.current.delete(key);
          setStatus('tooMany');
          return;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        setInfo({ phone: values.phone, time: '' });
        setStatus('success');
      } catch {
        // Network error, timeout (AbortError) or 5xx: allow the user to retry.
        sentPhones.current.delete(key);
        setStatus('error');
      } finally {
        clearTimeout(timer);
      }
    },
    [status, values, orderType, lang],
  );

  return { values, errors, status, info, setField, submit, reset };
}
