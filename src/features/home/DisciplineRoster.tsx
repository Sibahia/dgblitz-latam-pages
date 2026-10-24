import type { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { routePath } from '../../app/paths'
import { useLocale } from '../../app/useLocale'
import { CLASSES, DISCIPLINE_SUMMARIES } from '../calculator/data/disciplines'
import styles from './home.module.css'

function classNoteKey(className: string): string {
  if (className === 'Mage') return 'home.roster.classNoteMage'
  if (className === 'Rogue') return 'home.roster.classNoteRogue'
  return 'home.roster.classNotePaladin'
}

export function DisciplineRoster() {
  const { t } = useTranslation()
  const { locale } = useLocale()

  return (
    <section id="disciplines" className={styles.section} aria-labelledby="roster-title">
      <div className="container">
        <div className={styles.sectionHead}>
          <p className="eyebrow">{t('home.roster.eyebrow')}</p>
          <h2 id="roster-title">{t('home.roster.title')}</h2>
          <p className={styles.sectionLead}>{t('home.roster.lead')}</p>
        </div>

        <div className={styles.classList}>
          {CLASSES.map((className) => {
            const disciplines = DISCIPLINE_SUMMARIES.filter((item) => item.className === className)
            return (
              <div className={styles.classGroup} key={className}>
                <div className={styles.classHeader}>
                  <span className={styles.classKicker}>{t('calculator.className')}</span>
                  <h3>{className}</h3>
                  <p>{t(classNoteKey(className))}</p>
                </div>

                <div className={styles.disciplineList}>
                  {disciplines.map((discipline) => (
                    <Link
                      key={discipline.id}
                      className={styles.disciplineCard}
                      to={`${routePath(locale, 'calculator')}#${discipline.id}`}
                      style={{ '--discipline-accent': discipline.accent } as CSSProperties}
                    >
                      <span className={styles.disciplinePortrait}>
                        <img
                          src={discipline.portrait}
                          alt=""
                          width="381"
                          height="382"
                          loading="lazy"
                        />
                      </span>
                      <span className={styles.disciplineBody}>
                        <strong>{discipline.name}</strong>
                        <span className={styles.focusTags}>
                          {discipline.focus.map((focus) => (
                            <span key={focus}>{focus}</span>
                          ))}
                        </span>
                      </span>
                      <span className={styles.cardArrow} aria-hidden="true">
                        →
                      </span>
                      <span className="sr-only">{t('common.openCalculator')}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
