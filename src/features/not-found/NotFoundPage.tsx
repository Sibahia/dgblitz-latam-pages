import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { routePath } from '@/app/paths'
import { useDocumentMeta } from '@/app/useDocumentMeta'
import { useLocale } from '@/app/useLocale'
import styles from './not-found.module.css'

export function NotFoundPage() {
  const { t } = useTranslation()
  const { locale } = useLocale()
  useDocumentMeta(t('notFound.title'), t('notFound.lead'))

  return (
    <div className={`container ${styles.page}`}>
      <p className="eyebrow">404</p>
      <h1>{t('notFound.title')}</h1>
      <p className={styles.lead}>{t('notFound.lead')}</p>
      <Link className={`button button--primary ${styles.cta}`} to={routePath(locale, 'home')}>
        {t('notFound.cta')}
      </Link>
    </div>
  )
}
