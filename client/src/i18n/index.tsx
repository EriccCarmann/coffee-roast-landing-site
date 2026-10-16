'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import ru from './ru.json';
import by from './by.json';
import en from './en.json';

// `code` is the key used in the UI and in localStorage ("by" as requested).
// `html` is the real BCP-47 tag for <html lang>: Belarusian is "be", not "by".
export const LANGS = [
  { code: 'ru', label: 'RU', html: 'ru' },
  { code: 'by', label: 'BY', html: 'be' },
  { code: 'en', label: 'EN', html: 'en' },
] as const;

export type Lang = (typeof LANGS)[number]['code'];

const DICTS: Record<Lang, unknown> = { ru, by, en };
const STORAGE_KEY = 'kvarta.lang';

const isLang = (value: unknown): value is Lang => LANGS.some((l) => l.code === value);

function detectLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isLang(saved)) return saved;
  } catch {
    /* storage blocked: ignore */
  }
  const nav = (navigator.language || '').toLowerCase();
  if (nav.startsWith('be')) return 'by';
  if (nav.startsWith('en')) return 'en';
  return 'ru';
}

// lookup(dict, 'products.items.drip.name') -> whatever sits at that path
const lookup = (dict: unknown, path: string): unknown =>
  path.split('.').reduce<unknown>((node, part) => {
    if (node == null || typeof node !== 'object') return undefined;
    return (node as Record<string, unknown>)[part];
  }, dict);

type Vars = Record<string, string | number>;

type I18nValue = {
  lang: Lang;
  setLang: (code: Lang) => void;
  /** Text for a key. {name} placeholders are replaced from `vars`. */
  t: (key: string, vars?: Vars) => string;
  /** Array for a key (lists of strings or of {title, text} objects). */
  tList: <T = string>(key: string) => T[];
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  // IMPORTANT (Next.js): the server has no localStorage or navigator, so the first
  // render must be the same on the server and in the browser. We start with 'ru'
  // and switch to the visitor's language right after mount (see the effect below).
  const [lang, setLangState] = useState<Lang>('ru');

  useEffect(() => {
    setLangState(detectLang());
  }, []);

  const setLang = useCallback((code: Lang) => {
    setLangState(code);
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {
      /* ignore */
    }
  }, []);

  // Falls back to Russian, then to the key itself, so a missing string never crashes the page.
  const find = useCallback(
    (key: string): unknown => {
      const value = lookup(DICTS[lang], key);
      return value !== undefined ? value : lookup(DICTS.ru, key);
    },
    [lang],
  );

  const t = useCallback(
    (key: string, vars?: Vars): string => {
      const value = find(key);
      if (typeof value !== 'string') return key;
      if (!vars) return value;
      return value.replace(/\{(\w+)\}/g, (m, name: string) => (name in vars ? String(vars[name]) : m));
    },
    [find],
  );

  const tList = useCallback(
    <T = string,>(key: string): T[] => {
      const value = find(key);
      return Array.isArray(value) ? (value as T[]) : [];
    },
    [find],
  );

  // Keep <html lang>, <title> and the meta description in sync with the language.
  useEffect(() => {
    document.documentElement.lang = LANGS.find((l) => l.code === lang)!.html;
    document.title = t('meta.title');
    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.content = t('meta.description');
  }, [lang, t]);

  const value = useMemo(() => ({ lang, setLang, t, tList }), [lang, setLang, t, tList]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>');
  return ctx;
}
