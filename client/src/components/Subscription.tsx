'use client';

import { useI18n } from '../i18n';
import { useOrder } from '../context/OrderContext';
import { SUBSCRIPTION } from '../data/products';
import { COMPARE_PRICE } from '../data/site';
import Button from './Button';
import './Subscription.css';

export default function Subscription() {
  const { t, tList } = useI18n();
  const { chooseProduct } = useOrder();

  return (
    <section id="subscription" className="sub" aria-labelledby="sub-title">
      <div className="container sub__inner">
        <div>
          <h2 id="sub-title" className="sub__title">
            {t('subscription.title')}
          </h2>
          <p className="sub__text">{t('subscription.text')}</p>
          <ul className="sub__list">
            {tList('subscription.items').map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
          <Button as="a" href="#order" variant="light" onClick={() => chooseProduct(SUBSCRIPTION.id)}>
            {t('subscription.btn')}
          </Button>
        </div>

        <div className="sub__card">
          <p className="sub__cardlabel">{t('subscription.cardLabel')}</p>
          <p className="sub__price">
            {SUBSCRIPTION.price} BYN<span>{t('subscription.per')}</span>
          </p>
          <p className="sub__cardnote">{t('subscription.note1', { compare: COMPARE_PRICE })}</p>
          <p className="sub__cardnote">{t('subscription.note2')}</p>
        </div>
      </div>
    </section>
  );
}
