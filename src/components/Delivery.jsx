import T from '../language/T.jsx';
import { ICONS } from '../data/images.js';

const CARDS = [
  { n: 1, icon: ICONS.van_delivery_car },
  { n: 2, icon: ICONS.map_way_mark_where_adress },
];

export default function Delivery() {
  return (
    <section id="vb-k4v" className="vb-k4v" aria-labelledby="vb-k4v-title">
      <div className="vb-k4v__inner">
        <h2 id="vb-k4v-title" className="vb-k4v__title"><T k="delivery.title" /></h2>
        <div className="vb-k4v__grid">
          {CARDS.map(({ n, icon }) => (
            <div key={n} className="vb-k4v__card">
              <div className="vb-k4v__icon"><img src={icon} alt="" aria-hidden="true" /></div>
              <h3 className="vb-k4v__cardtitle"><T k={`delivery.c${n}t`} /></h3>
              <p className="vb-k4v__cardtext"><T k={`delivery.c${n}x`} /></p>
              <p className="vb-k4v__cardtext"><T k={`delivery.c${n}y`} /></p>
            </div>
          ))}
        </div>
        <p className="vb-k4v__note"><T k="delivery.note" /></p>
      </div>
    </section>
  );
}
