import { LANGS, useLang } from '../language/LangContext.jsx';
import T from '../language/T.jsx';
import Button from './Button.jsx';
import {ICONS, PHOTOS} from '../data/images.js';
import { PRICES } from '../data/products.js';
import {BEANS_SRC} from "./CoffeeBeans.jsx";
export const LOGO = '/images/logo_kvarta.png';

// The dark curved shape on the right. EDGE is the curve itself; it is drawn once as the fill and again,
// shifted to the right, as the contour lines. The svg stretches with the hero (preserveAspectRatio="none").
const EDGE = 'M1440 0 L1230 0 C1130 30 990 70 880 180 C770 290 650 520 560 800';
const CONTOURS = [46, 104, 176, 262, 362, 480];
const LOOPS = [
  'M1010 640 C1070 586 1190 598 1232 662 C1274 726 1204 786 1108 774 C1022 764 962 694 1010 640Z',
  'M1052 664 C1098 628 1176 636 1204 680 C1230 724 1180 760 1112 752 C1056 744 1020 700 1052 664Z',
];

const NAV = [['#vb-f7q', 'nav1'], ['#vb-m2x', 'nav2'], ['#vb-p9d', 'nav3'], ['#vb-k4v', 'nav4'], ['#vb-r8n', 'nav5']];

export default function Hero() {
  const { lang, setLang, t } = useLang();
  return (
      <section id="vb-h3k" className="vb-h3k" aria-labelledby="vb-h3k-title">
        <div className="vb-h3k__bg" aria-hidden="true">
          <div className="vb-h3k__pattern" />
          <svg className="vb-h3k__curve" viewBox="0 0 1440 800" preserveAspectRatio="none" focusable="false">
            <defs>
              <linearGradient id="vb-h3k-dark" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#33200f" />
                <stop offset="0.5" stopColor="#1a0f08" />
                <stop offset="1" stopColor="#0d0804" />
              </linearGradient>
              <radialGradient id="vb-h3k-glow" cx="0.7" cy="0.46" r="0.42">
                <stop offset="0" stopColor="#da984a" stopOpacity="0.24" />
                <stop offset="1" stopColor="#da984a" stopOpacity="0" />
              </radialGradient>
            </defs>
            <path d={`${EDGE} L1440 800 Z`} fill="url(#vb-h3k-dark)" />
            <path d={`${EDGE} L1440 800 Z`} fill="url(#vb-h3k-glow)" />
            <g fill="none" stroke="#da984a" vectorEffect="non-scaling-stroke">
              {CONTOURS.map((dx, i) => (
                  <path key={dx} d={EDGE} transform={`translate(${dx} 0)`} strokeOpacity={0.3 - i * 0.04} vectorEffect="non-scaling-stroke" />
              ))}
              {LOOPS.map((d, i) => <path key={i} d={d} strokeOpacity={0.22 - i * 0.05} vectorEffect="non-scaling-stroke" />)}
            </g>
            <path d={EDGE} fill="none" stroke="#ebb26a" strokeOpacity="0.55" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          </svg>
        </div>

        <div className="vb-h3k__inner">
          <div className="vb-h3k__top">
            <div className="vb-h3k__brand">
              <img src={LOGO} alt="" draggable="false" className="logo"/>
              <span className="vb-h3k__brand-slogan"><T k="hero.slogan" /></span>
            </div>
            <nav className="vb-h3k__nav" aria-label={t('hero.navAria')}>
              {NAV.map(([href, key]) => <a key={key} href={href}><T k={`hero.${key}`} /></a>)}
            </nav>
            <div className="vb-h3k__lang" role="group" aria-label={t('hero.langAria')}>
              {LANGS.map((code) => (
                  <button
                      key={code}
                      type="button"
                      className={`vb-h3k__langbtn${code === lang ? ' is-active' : ''}`}
                      aria-pressed={code === lang}
                      onClick={() => setLang(code)}
                  >
                    {code.toUpperCase()}
                  </button>
              ))}
            </div>
          </div>

          <div className="vb-h3k__grid">
            <div>
              <h1 id="vb-h3k-title" className="vb-h3k__title vb-h3k__anim vb-h3k__anim--2"><T k="hero.title" /></h1>
              <p className="vb-h3k__lead vb-h3k__anim vb-h3k__anim--3"><T k="hero.lead" /></p>
              <div className="vb-h3k__actions vb-h3k__anim vb-h3k__anim--4">
                <Button href="#vb-m2x" className="vb-h3k__btn--primary"><T k="hero.btn1" /></Button>
                <Button href="#vb-p9d" className="vb-h3k__btn--ghost"><T k="hero.btn2" vars={{ price: PRICES.sub }} /></Button>
              </div>
              <p className="vb-h3k__note vb-h3k__anim vb-h3k__anim--5"><T k="hero.note" /></p>
            </div>
            <div className="vb-h3k__stage">
              <div className="vb-h3k__photo vb-h3k__anim vb-h3k__anim--3">
                <img src={PHOTOS.hero.src} alt={PHOTOS.hero.alt} loading="eager" />
              </div>
            </div>
          </div>

          <div className="vb-h3k__schedule">
            {['sch1', 'sch2', 'sch3'].map((key) => <span key={key}><T k={`hero.${key}`} /></span>)}
          </div>
        </div>
      </section>
  );
}
