'use client';

import { useI18n } from '../i18n';
import { img } from '../data/images';
import type { ImageKey } from '../data/images';
import Rich from './Rich';
import './About.css';

const ICONS: ImageKey[] = ['iconCoffee', 'iconClock', 'iconLeaf']; // one per item, same order as the i18n array

export default function About() {
  const { t, tList } = useI18n();
  return (
    <section id="freshness" className="about" aria-labelledby="about-title">
      <div className="container about__inner">
        <div>
          <h2 id="about-title" className="about__title">
            {t('about.title')}
          </h2>
          <p className="about__text">{t('about.p1')}</p>
          <p className="about__text">
            <Rich text={t('about.p2')} />
          </p>
          <ul className="about__list">
            {tList<{ title: string; text: string }>('about.items').map((item, i) => (
              <li key={i} className="about__item">
                <div className="about__icon">
                  <img src={img(ICONS[i])} alt="" aria-hidden="true" />
                </div>
                <div>
                  <p className="about__itemtitle">{item.title}</p>
                  <p className="about__itemtext">{item.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="about__photo">
            <img src={img('packing')} alt={t('about.imgAlt')} loading="lazy" />
          </div>
          <p className="about__caption">{t('about.caption')}</p>
        </div>
      </div>
    </section>
  );
}
