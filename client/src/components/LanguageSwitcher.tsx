'use client';

import { LANGS, useI18n } from '../i18n';

export default function LanguageSwitcher() {
  const { lang, setLang, t } = useI18n();
  return (
    <div className="lang" role="group" aria-label={t('header.langLabel')}>
      {LANGS.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          className={`lang__btn${code === lang ? ' is-active' : ''}`}
          aria-pressed={code === lang}
          onClick={() => setLang(code)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
