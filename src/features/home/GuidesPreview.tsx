import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { guideAnchor, routePath } from '../../app/paths'
import { useLocale } from '../../app/useLocale'
import styles from './home.module.css'

const GUIDE_LINKS = [
  {
    anchor: 'calculadora',
    title: 'home.guides.calculatorTitle',
    description: 'home.guides.calculatorDescription',
  },
  {
    anchor: 'sistema',
    title: 'home.guides.systemTitle',
    description: 'home.guides.systemDescription',
  },
  {
    anchor: 'enlaces',
    title: 'home.guides.linksTitle',
    description: 'home.guides.linksDescription',
  },
] as const

export function GuidesPreview() {
  const { t } = useTranslation()
  const { locale } = useLocale()

  return (
    <section className={styles.section} aria-labelledby="guides-preview-title">
      <div className="container">
        <div className={styles.sectionHead}>
          <p className="eyebrow">{t('home.guides.eyebrow')}</p>
          <h2 id="guides-preview-title">{t('home.guides.title')}</h2>
          <p className={styles.sectionLead}>{t('home.guides.lead')}</p>
        </div>

        <div className={styles.guideList}>
          {GUIDE_LINKS.map((guide) => (
            <Link
              key={guide.anchor}
              className={styles.guideCard}
              to={guideAnchor(locale, guide.anchor)}
            >
              <span className={styles.guideBody}>
                <strong>{t(guide.title)}</strong>
                <span>{t(guide.description)}</span>
              </span>
              <span className={styles.guideArrow} aria-hidden="true">
                →
              </span>
            </Link>
          ))}
        </div>

        <Link className={`button button--ghost ${styles.guidesCta}`} to={routePath(locale, 'guides')}>
          {t('home.guides.cta')}
        </Link>
      </div>
    </section>
  )
}
