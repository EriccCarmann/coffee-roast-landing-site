'use client';

import { useI18n } from '../i18n';
import { useOrder } from '../context/OrderContext';
import { img } from '../data/images';
import { ROAST_PRODUCTS } from '../data/products';
import Button from './Button';
import './Products.css';

export default function Products() {
  const { t } = useI18n();
  const { chooseProduct } = useOrder();

  return (
    <section id="roasts" className="products" aria-labelledby="products-title">
      <div className="container products__inner">
        <div className="products__head">
          <h2 id="products-title" className="products__title">
            {t('products.title')}
          </h2>
          <p className="products__subtitle">{t('products.subtitle')}</p>
        </div>

        <div className="products__grid">
          {ROAST_PRODUCTS.map((p) => {
            const base = `products.items.${p.id}`;
            return (
              <article key={p.id} className="products__card">
                <div className="products__imgwrap">
                  <img src={img(p.image)} alt={t(`${base}.alt`)} loading="lazy" />
                </div>
                <div className="products__body">
                  <h3 className="products__name">{t(`${base}.name`)}</h3>
                  <p className="products__flavors">{t(`${base}.flavor`)}</p>
                  <p className="products__roast">{t(`${base}.roast`)}</p>
                  <div className="products__bottom">
                    <div className="products__price">
                      {p.price} BYN<span>{t(`${base}.unit`)}</span>
                    </div>
                    <Button
                      as="a"
                      href="#order"
                      variant="outline"
                      size="sm"
                      onClick={() => chooseProduct(p.id)}
                    >
                      {t('products.btn')}
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <p className="products__foot">{t('products.foot')}</p>
      </div>
    </section>
  );
}
