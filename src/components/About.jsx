import T from '../language/T.jsx';
import { ICONS, PHOTOS } from '../data/images.js';

const ITEMS = [
  { n: 1, icon: ICONS.coffee_machine_drink },
  { n: 2, icon: ICONS.watch_clock_time },
  { n: 3, icon: ICONS.recycle_eco_leaf },
];

export default function About() {
  return (
    <section id="vb-f7q" className="vb-f7q" aria-labelledby="vb-f7q-title">
      <div className="vb-f7q__inner">
        <div>
          <h2 id="vb-f7q-title" className="vb-f7q__title"><T k="about.title" /></h2>
          <p className="vb-f7q__text"><T k="about.p1" /></p>
          <p className="vb-f7q__text"><T k="about.p2" /></p>
          <ul className="vb-f7q__list">
            {ITEMS.map(({ n, icon }) => (
              <li key={n} className="vb-f7q__item">
                <div className="vb-f7q__icon"><img src={icon} alt="" aria-hidden="true" /></div>
                <div>
                  <p className="vb-f7q__itemtitle"><T k={`about.it${n}t`} /></p>
                  <p className="vb-f7q__itemtext"><T k={`about.it${n}x`} /></p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="vb-f7q__photo"><img src={PHOTOS.about.src} alt={PHOTOS.about.alt} loading="lazy" /></div>
          <p className="vb-f7q__caption"><T k="about.caption" /></p>
        </div>
      </div>
    </section>
  );
}
