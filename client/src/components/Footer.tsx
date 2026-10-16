'use client';

import { useI18n } from '../i18n';
import Rich from './Rich';
import './Footer.css';

export default function Footer() {
  const { t } = useI18n();
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div>
          <p className="footer__brand">{t('footer.brand')}</p>
          <p className="footer__text">{t('footer.text')}</p>
        </div>
        <p className="footer__contacts">
          <Rich text={t('footer.contacts')} />
        </p>
      </div>
    </footer>
  );
}
