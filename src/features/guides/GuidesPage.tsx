import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { routePath } from '@/app/paths'
import { useDocumentMeta } from '@/app/useDocumentMeta'
import { useLocale } from '@/app/useLocale'
import styles from './guides.module.css'

const SECTIONS = [
  { id: 'calculadora', titleKey: 'guides.calculatorTitle' },
  { id: 'sistema', titleKey: 'guides.systemTitle' },
  { id: 'enlaces', titleKey: 'guides.linksTitle' },
  { id: 'glosario', titleKey: 'guides.glossaryTitle' },
  { id: 'fuente', titleKey: 'guides.sourceTitle' },
] as const

const TERMS = [
  ['termTalentstone', 'termTalentstoneDef'],
  ['termSocket', 'termSocketDef'],
  ['termTier', 'termTierDef'],
  ['termSkill', 'termSkillDef'],
  ['termDiscipline', 'termDisciplineDef'],
  ['termClass', 'termClassDef'],
] as const

export function GuidesPage() {
  const { t } = useTranslation()
  const { locale } = useLocale()
  useDocumentMeta(t('guides.metaTitle'), t('guides.metaDescription'))

  return (
    <div className={styles.page}>
      <header className={`container ${styles.head}`}>
        <p className="eyebrow">{t('guides.eyebrow')}</p>
        <h1>{t('guides.title')}</h1>
        <p className={styles.lead}>{t('guides.lead')}</p>
      </header>

      <div className={`container ${styles.layout}`}>
        <aside className={styles.toc}>
          <h2>{t('guides.toc')}</h2>
          <nav aria-label={t('guides.toc')}>
            {SECTIONS.map((section) => (
              <a key={section.id} href={`#${section.id}`}>
                {t(section.titleKey)}
              </a>
            ))}
          </nav>
        </aside>

        <article className={styles.article}>
          <section id="calculadora">
            <h2>{t('guides.calculatorTitle')}</h2>
            <p>{t('guides.calculatorIntro')}</p>
            <ol className={styles.steps}>
              <li>{t('guides.calculatorStep1')}</li>
              <li>{t('guides.calculatorStep2')}</li>
              <li>{t('guides.calculatorStep3')}</li>
              <li>{t('guides.calculatorStep4')}</li>
            </ol>
            <Link className={`button button--primary ${styles.cta}`} to={routePath(locale, 'calculator')}>
              {t('home.spotlight.cta')}
            </Link>
          </section>

          <section id="sistema">
            <h2>{t('guides.systemTitle')}</h2>
            <p>{t('guides.systemIntro')}</p>
            <ul className={styles.facts}>
              <li>{t('guides.systemFact1')}</li>
              <li>{t('guides.systemFact2')}</li>
              <li>{t('guides.systemFact3')}</li>
              <li>{t('guides.systemFact4')}</li>
              <li>{t('guides.systemFact5')}</li>
            </ul>
          </section>

          <section id="enlaces">
            <h2>{t('guides.linksTitle')}</h2>
            <p>{t('guides.linksIntro')}</p>
            <p className={styles.code}>{t('guides.linksFormat')}</p>
            <p>{t('guides.linksExample')}</p>
            <p>{t('guides.linksNote')}</p>
          </section>

          <section id="glosario">
            <h2>{t('guides.glossaryTitle')}</h2>
            <dl className={styles.glossary}>
              {TERMS.map(([termKey, definitionKey]) => (
                <div key={termKey}>
                  <dt>{t(`guides.${termKey}`)}</dt>
                  <dd>{t(`guides.${definitionKey}`)}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section id="fuente">
            <h2>{t('guides.sourceTitle')}</h2>
            <p>{t('guides.sourceBody')}</p>
            <a
              className={`button button--ghost ${styles.cta}`}
              href="https://github.com/Sibahia/dgblitz-latam-pages"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('guides.sourceLink')}
            </a>
          </section>
        </article>
      </div>
    </div>
  )
}
