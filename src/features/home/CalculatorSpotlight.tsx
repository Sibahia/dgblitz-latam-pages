import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { routePath } from '@/app/paths'
import { useLocale } from '@/app/useLocale'
import { iconUrl, UI } from '@/features/calculator/data/assets'
import { getDisciplineSummary } from '@/features/calculator/data/disciplines'
import flameseerData from '@/features/calculator/data/flameseer.json'
import type { DisciplineData } from '@/features/calculator/data/types'
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
            <img
              className={styles.miniPortrait}
              src={preview.portrait}
              srcSet={`${preview.portraitMedium} 256w, ${preview.portrait} 382w`}
              sizes="(max-width: 480px) 188px, 239px"
              alt=""
              width="381"
              height="382"
              loading="lazy"
              decoding="async"
            />
            <img
              className={styles.miniTreeArt}
              src={UI.treeArt}
              alt=""
              width="608"
              height="608"
              loading="lazy"
              decoding="async"
            />
            {MINI_NODES.map((node, index) => {
              const talent = talents[index]
              if (!talent) return null
              return (
                <span
                  className={styles.miniNode}
                  key={talent.icon}
                  style={{ left: node.left, top: node.top }}
                >
                  <img
                    src={iconUrl(talent.icon)}
                    alt=""
                    width="52"
                    height="52"
                    loading="lazy"
                    decoding="async"
                  />
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
