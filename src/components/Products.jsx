import T from '../language/T.jsx';
import Button from './Button.jsx';
import { PHOTOS } from '../data/images.js';
import { PRODUCTS } from '../data/products.js';

export default function Products({ onOrder }) {
  return (
    <section id="vb-m2x" className="vb-m2x" aria-labelledby="vb-m2x-title">
      <div className="vb-m2x__inner">
        <div className="vb-m2x__head">
          <h2 id="vb-m2x-title" className="vb-m2x__title"><T k="products.title" /></h2>
          <p className="vb-m2x__subtitle"><T k="products.subtitle" /></p>
        </div>

        <div className="vb-m2x__grid">
          {PRODUCTS.map(({ id, n, price, order }) => (
            <article key={id} className="vb-m2x__card">
              <div className="vb-m2x__imgwrap">
                <img src={PHOTOS[id].src} alt={PHOTOS[id].alt} loading="lazy" />
              </div>
              <div className="vb-m2x__body">
                <h3 className="vb-m2x__name"><T k={`products.n${n}`} /></h3>
                <p className="vb-m2x__flavors"><T k={`products.f${n}`} /></p>
                <p className="vb-m2x__roast"><T k={`products.r${n}`} /></p>
                <div className="vb-m2x__bottom">
                  <div className="vb-m2x__price">{price} BYN<span><T k={`products.unit${n}`} /></span></div>
                  <Button
                    size="sm"
                    href="#vb-r8n"
                    className="vb-m2x__btn"
                    onClick={(e) => { e.preventDefault(); onOrder(order); }}
                  >
                    <T k="products.btn" />
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <p className="vb-m2x__foot"><T k="products.foot" /></p>
      </div>
    </section>
  );
}
