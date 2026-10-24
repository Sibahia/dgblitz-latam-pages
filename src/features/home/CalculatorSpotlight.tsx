import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { routePath } from '../../app/paths'
import { useLocale } from '../../app/useLocale'
import { iconUrl, UI } from '../calculator/data/assets'
import { getDisciplineSummary } from '../calculator/data/disciplines'
import flameseerData from '../calculator/data/flameseer.json'
import type { DisciplineData } from '../calculator/data/types'
import styles from './home.module.css'

const MINI_NODES = [
  { left: '50%', top: '8%' },
  { left: '79%', top: '19%' },
  { left: '88%', top: '54%' },
  { left: '69%', top: '84%' },
  { left: '31%', top: '84%' },
  { left: '12%', top: '48%' },
]

export function CalculatorSpotlight() {
  const { t } = useTranslation()
  const { locale } = useLocale()
  const preview = getDisciplineSummary(1)
  const talents = (flameseerData as DisciplineData).talents
  const features = [
    t('home.spotlight.featureTree'),
    t('home.spotlight.featureLinks'),
    t('home.spotlight.featureOffline'),
  ]

  return (
    <section className={styles.spotlight} aria-labelledby="spotlight-title">
      <div className={`container ${styles.spotlightGrid}`}>
        <div className={styles.spotlightVisual} aria-hidden="true">
          <div className={styles.miniTree}>
            <img className={styles.miniPortrait} src={preview.portrait} alt="" loading="lazy" />
            <img className={styles.miniTreeArt} src={UI.treeArt} alt="" loading="lazy" />
            {MINI_NODES.map((node, index) => {
              const talent = talents[index]
              if (!talent) return null
              return (
                <span
                  className={styles.miniNode}
                  key={talent.icon}
                  style={{ left: node.left, top: node.top }}
                >
                  <img src={iconUrl(talent.icon)} alt="" loading="lazy" />
                </span>
              )
            })}
            <span className={styles.miniHud}>
              <strong>90</strong> {t('home.spotlight.pointsLabel')}
            </span>
          </div>
        </div>

        <div className={styles.spotlightCopy}>
          <p className="eyebrow">{t('home.spotlight.eyebrow')}</p>
          <h2 id="spotlight-title">{t('home.spotlight.title')}</h2>
          <p className={styles.sectionLead}>{t('home.spotlight.lead')}</p>
          <ul className={styles.featureList}>
            {features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
          <Link
            className={`button button--primary ${styles.spotlightCta}`}
            to={routePath(locale, 'calculator')}
          >
            {t('home.spotlight.cta')}
          </Link>
        </div>
      </div>
    </section>
  )
}
