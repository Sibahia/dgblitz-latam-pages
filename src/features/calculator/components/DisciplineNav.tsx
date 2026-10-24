import { useEffect, useRef, type CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { DISCIPLINES, UI } from '../data/meta'
import styles from '../calculator.module.css'

interface DisciplineNavProps {
  disciplineId: number
  onSelect: (disciplineId: number) => void
}

export function DisciplineNav({ disciplineId, onSelect }: DisciplineNavProps) {
  const { t } = useTranslation()
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const nav = navRef.current
    const active = nav?.querySelector<HTMLButtonElement>('button[aria-pressed="true"]')
    if (!nav || !active) return
    const navRect = nav.getBoundingClientRect()
    const activeRect = active.getBoundingClientRect()
    const target =
      nav.scrollLeft + activeRect.left - navRect.left - (navRect.width - activeRect.width) / 2
    nav.scrollTo({ left: Math.max(0, target), behavior: 'smooth' })
  }, [disciplineId])

  return (
    <nav ref={navRef} className={styles.nav} aria-label={t('calculator.navLabel')}>
      <div className={styles.navRail} style={{ backgroundImage: `url(${UI.navBackground})` }}>
        {DISCIPLINES.map((discipline) => (
          <button
            key={discipline.id}
            type="button"
            className={styles.navButton}
            style={
              {
                '--nav-x': `${-66 * discipline.id}px`,
                backgroundImage: `url(${UI.navSprite})`,
              } as CSSProperties
            }
            aria-pressed={discipline.id === disciplineId}
            aria-label={t('calculator.selectDiscipline', { discipline: discipline.name })}
            title={`${discipline.name} — ${discipline.className}`}
            onClick={() => onSelect(discipline.id)}
          >
            <span className={styles.navName}>{discipline.name}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
