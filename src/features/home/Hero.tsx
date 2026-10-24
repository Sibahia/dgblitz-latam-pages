import { useState, type CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { routePath } from '../../app/paths'
import { useLocale } from '../../app/useLocale'
import { DISCIPLINE_SUMMARIES, getDisciplineSummary } from '../calculator/data/disciplines'
import styles from './home.module.css'

const HERO_STATS = [
  ['disciplinesValue', 'disciplinesLabel'],
  ['classesValue', 'classesLabel'],
  ['pointsValue', 'pointsLabel'],
  ['talentsValue', 'talentsLabel'],
] as const

export function Hero() {
  const { t } = useTranslation()
  const { locale } = useLocale()
  const [activeId, setActiveId] = useState(1)
  const discipline = getDisciplineSummary(activeId)
  const themeStyle = { '--discipline-accent': discipline.accent } as CSSProperties

  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={`container ${styles.heroGrid}`}>
        <div className={styles.heroCopy}>
          <p className="eyebrow">{t('home.hero.eyebrow')}</p>
          <h1 id="hero-title" className={styles.heroTitle}>
            <span>{t('home.hero.titleTop')}</span>
            <span>{t('home.hero.titleBottom')}</span>
            <em>{t('home.hero.titleAccent')}</em>
          </h1>
          <p className={styles.heroLead}>{t('home.hero.lead')}</p>

          <div className={styles.heroActions}>
            <Link
              className="button button--primary"
              to={`${routePath(locale, 'calculator')}#${discipline.id}`}
            >
              {t('home.hero.primary', { discipline: discipline.name })}
            </Link>
            <a className={`button button--ghost ${styles.heroGhost}`} href="#disciplines">
              {t('home.hero.secondary')}
            </a>
          </div>

          <dl className={styles.heroStats}>
            {HERO_STATS.map(([valueKey, labelKey]) => (
              <div className={styles.heroStat} key={valueKey}>
                <dt>{t(`home.hero.stats.${labelKey}`)}</dt>
                <dd>{t(`home.hero.stats.${valueKey}`)}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className={styles.heroStage}>
          <div className={styles.portraitFrame} style={themeStyle}>
            <div className={styles.portraitGlow} aria-hidden="true" />
            <img
              className={styles.heroPortrait}
              src={discipline.portrait}
              alt={`${discipline.name} — ${discipline.className}`}
              width="381"
              height="382"
            />
            <div className={styles.portraitLabel}>
              <span>{t('home.hero.classLabel', { className: discipline.className })}</span>
              <strong>{discipline.name}</strong>
            </div>
          </div>

          <div className={styles.roster} role="group" aria-label={t('home.hero.rosterLabel')}>
            {DISCIPLINE_SUMMARIES.map((item) => (
              <button
                type="button"
                key={item.id}
                className={styles.rosterButton}
                onClick={() => setActiveId(item.id)}
                aria-pressed={item.id === activeId}
                aria-label={t('calculator.selectDiscipline', { discipline: item.name })}
                title={item.name}
              >
                <img src={item.portrait} alt="" width="381" height="382" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
