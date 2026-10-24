import { useTranslation } from 'react-i18next'
import { useDocumentMeta } from '../../app/useDocumentMeta'
import { CalculatorSpotlight } from './CalculatorSpotlight'
import { DisciplineRoster } from './DisciplineRoster'
import { GuidesPreview } from './GuidesPreview'
import { Hero } from './Hero'
import styles from './home.module.css'

export function HomePage() {
  const { t } = useTranslation()
  useDocumentMeta(t('home.metaTitle'), t('home.metaDescription'))

  return (
    <div className={styles.home}>
      <Hero />
      <DisciplineRoster />
      <CalculatorSpotlight />
      <GuidesPreview />
    </div>
  )
}
