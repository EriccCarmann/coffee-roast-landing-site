'use client';

import { useI18n } from '../i18n';
import { img } from '../data/images';
import { DELIVERY_FEE } from '../data/site';
import Rich from './Rich';
import './Delivery.css';

export default function Delivery() {
  const { t } = useI18n();
  return (
    <section id="delivery" className="delivery" aria-labelledby="delivery-title">
      <div className="container delivery__inner">
        <h2 id="delivery-title" className="delivery__title">
          {t('delivery.title')}
        </h2>

        <div className="delivery__grid">
          <div className="delivery__card">
            <div className="delivery__icon">
              <img src={img('iconVan')} alt="" aria-hidden="true" />
            </div>
            <h3 className="delivery__cardtitle">{t('delivery.city.title')}</h3>
            <p className="delivery__cardtext">
              <Rich text={t('delivery.city.text')} />
            </p>
            <p className="delivery__cardtext">
              <Rich text={t('delivery.city.fee', { fee: DELIVERY_FEE })} />
            </p>
          </div>

          <div className="delivery__card">
            <div className="delivery__icon">
              <img src={img('iconMap')} alt="" aria-hidden="true" />
            </div>
            <h3 className="delivery__cardtitle">{t('delivery.pickup.title')}</h3>
            <p className="delivery__cardtext">{t('delivery.pickup.address')}</p>
            <p className="delivery__cardtext">
              <Rich text={t('delivery.pickup.text')} />
            </p>
          </div>
        </div>

        <p className="delivery__note">{t('delivery.note')}</p>
      </div>
    </section>
  );
}
