'use client';

import { useI18n } from '../i18n';
import { img } from '../data/images';
import { PHONE_DISPLAY, PHONE_TEL, TELEGRAM_URL, VIBER_URL } from '../data/site';
import OrderForm from './OrderForm';
import './OrderSection.css';

export default function OrderSection() {
  const { t } = useI18n();
  return (
    <section id="order" className="order" aria-labelledby="order-title">
      <div className="container order__inner">
        <div>
          <h2 id="order-title" className="order__title">
            {t('order.title')}
          </h2>
          <p className="order__lead">{t('order.lead')}</p>

          <ul className="order__contacts">
            <li className="order__contact">
              <div className="order__cicon">
                <img src={img('iconPhone')} alt="" aria-hidden="true" />
              </div>
              <div>
                <p className="order__clabel">{t('order.contacts.call')}</p>
                <p className="order__cvalue">
                  <a href={`tel:${PHONE_TEL}`}>{PHONE_DISPLAY}</a>
                </p>
                <p className="order__cnote">{t('order.contacts.callNote')}</p>
              </div>
            </li>
            <li className="order__contact">
              <div className="order__cicon">
                <img src={img('iconCoffee')} alt="" aria-hidden="true" />
              </div>
              <div>
                <p className="order__clabel">{t('order.contacts.write')}</p>
                <p className="order__cvalue">
                  <a href={TELEGRAM_URL}>Telegram</a> · <a href={VIBER_URL}>Viber</a>
                </p>
                <p className="order__cnote">{t('order.contacts.writeNote')}</p>
              </div>
            </li>
            <li className="order__contact">
              <div className="order__cicon">
                <img src={img('iconMap')} alt="" aria-hidden="true" />
              </div>
              <div>
                <p className="order__clabel">{t('order.contacts.pickup')}</p>
                <p className="order__cvalue">{t('order.contacts.pickupAddress')}</p>
                <p className="order__cnote">{t('order.contacts.pickupNote')}</p>
              </div>
            </li>
          </ul>
        </div>

        <OrderForm />
      </div>
    </section>
  );
}
