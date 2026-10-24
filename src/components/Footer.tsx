import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { routePath } from '../app/paths'
import { useLocale } from '../app/useLocale'
import styles from './Footer.module.css'

export function Footer() {
  const { t } = useTranslation()
  const { locale } = useLocale()

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brandBlock}>
          <Link className={styles.brand} to={routePath(locale, 'home')}>
            DGBLITZ <span>LATAM</span>
          </Link>
          <p className={styles.disclaimer}>{t('footer.disclaimer')}</p>
        </div>

        <div className={styles.links}>
          <Link to={routePath(locale, 'calculator')}>{t('nav.calculator')}</Link>
          <Link to={routePath(locale, 'guides')}>{t('nav.guides')}</Link>
          <a
            href="https://github.com/Sibahia/dgblitz-latam-pages"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('footer.source')}
          </a>
          <a
            href="https://github.com/Sibahia/dgblitz-latam-pages/blob/main/LICENSE"
            target="_blank"
            rel="noopener noreferrer"
          >
            GPL-3.0
          </a>
        </div>

        <p className={styles.meta}>
          {t('footer.license')} {t('footer.made')}
        </p>
      </div>
    </footer>
  )
}
