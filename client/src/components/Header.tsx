'use client';

import { useI18n } from '../i18n';
import { NAV } from '../data/site';
import LanguageSwitcher from './LanguageSwitcher';
import './Header.css';

export default function Header() {
  const { t } = useI18n();
  return (
    <div className="header">
      <div className="header__brand">
        {t('header.brand')}
        <span className="header__slogan">{t('header.slogan')}</span>
      </div>
      <nav className="header__nav" aria-label={t('header.navLabel')}>
        {NAV.map((id) => (
          <a key={id} href={`#${id}`}>
            {t(`header.nav.${id}`)}
          </a>
        ))}
      </nav>
      <LanguageSwitcher />
    </div>
  );
}
