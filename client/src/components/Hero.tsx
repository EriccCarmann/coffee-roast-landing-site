'use client';

import { useI18n } from '../i18n';
import { img } from '../data/images';
import { SUBSCRIPTION } from '../data/products';
import Header from './Header';
import Button from './Button';
import Rich from './Rich';
import './Hero.css';

export default function Hero() {
  const { t, tList } = useI18n();
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="container">
        <Header />

        <div className="hero__grid">
          <div>
            <p className="hero__eyebrow anim">{t('hero.eyebrow')}</p>
            <h1 id="hero-title" className="hero__title anim anim--2">
              <Rich text={t('hero.title')} />
            </h1>
            <p className="hero__lead anim anim--3">{t('hero.lead')}</p>
            <div className="hero__actions anim anim--4">
              <Button as="a" href="#roasts">
                {t('hero.btnRoasts')}
              </Button>
              <Button as="a" href="#subscription" variant="ghost">
                {t('hero.btnSubscription', { price: SUBSCRIPTION.price })}
              </Button>
            </div>
            <p className="hero__note anim anim--5">{t('hero.note')}</p>
          </div>

          <div className="hero__photo anim anim--3">
            <img src={img('hero')} alt={t('hero.imgAlt')} loading="eager" />
          </div>
        </div>

        <div className="hero__schedule">
          {tList('hero.schedule').map((line, i) => (
            <span key={i}>
              <Rich text={line} />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
