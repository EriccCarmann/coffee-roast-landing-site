import T from '../language/T.jsx';
import Button from './Button.jsx';
import { PRICES, SUBSCRIPTION_ORDER } from '../data/products.js';

export default function Subscription({ onOrder }) {
  return (
    <section id="vb-p9d" className="vb-p9d" aria-labelledby="vb-p9d-title">
      <div className="vb-p9d__inner">
        <div>
          <h2 id="vb-p9d-title" className="vb-p9d__title"><T k="subscription.title" /></h2>
          <p className="vb-p9d__text"><T k="subscription.text" /></p>
          <ul className="vb-p9d__list">
            {[1, 2, 3, 4].map((n) => <li key={n}><T k={`subscription.li${n}`} /></li>)}
          </ul>
          <Button
            href="#vb-r8n"
            className="vb-p9d__btn"
            onClick={(e) => { e.preventDefault(); onOrder(SUBSCRIPTION_ORDER); }}
          >
            <T k="subscription.btn" />
          </Button>
        </div>
        <div className="vb-p9d__card">
          <p className="vb-p9d__cardlabel"><T k="subscription.cardlabel" /></p>
          <p className="vb-p9d__price">{PRICES.sub} BYN<span><T k="subscription.per" /></span></p>
          <p className="vb-p9d__cardnote"><T k="subscription.note1" /></p>
          <p className="vb-p9d__cardnote"><T k="subscription.note2" /></p>
        </div>
      </div>
    </section>
  );
}
