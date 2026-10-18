import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import ru from './locales/ru.json';
import by from './locales/by.json';
import en from './locales/en.json';

const LOCALES = { ru, by, en };
export const LANGS = ['ru', 'by', 'en'];
export const DEFAULT_LANG = 'ru'; // main language of the site; also the fallback for missing strings

// Internal code for Belarusian is "by" (and the button says BY),
// but the <html lang> attribute must be valid BCP 47, which for Belarusian is "be".
const HTML_LANG = { ru: 'ru', by: 'be', en: 'en' };

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLang] = useState(DEFAULT_LANG);

  useEffect(() => {
    document.documentElement.lang = HTML_LANG[lang];
  }, [lang]);

  // t('order.o2', { price: 32 }) -> string in the current language; falls back to Russian if missing.
  const t = useCallback((key, vars) => {
    const [section, name] = key.split('.');
    let text = LOCALES[lang]?.[section]?.[name] ?? LOCALES[DEFAULT_LANG][section]?.[name] ?? key;
    if (vars) for (const [k, v] of Object.entries(vars)) text = text.replaceAll(`{${k}}`, v);
    return text;
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, t]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);
