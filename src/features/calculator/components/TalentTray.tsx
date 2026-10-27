import { useTranslation } from 'react-i18next'
import {
  talentsByTier,
  tierRequiredPoints,
  type StoneMap,
} from '@/features/calculator/model/calculator'
import { iconUrl, type DisciplineMeta } from '@/features/calculator/data/meta'
import styles from '@/features/calculator/calculator.module.css'

interface TalentTrayProps {
  discipline: DisciplineMeta
  stones: StoneMap
  pointsSpent: number
  selectedTalentId: number | null
  onTalentClick: (talentId: number) => void
}

export function TalentTray({
  discipline,
  stones,
  pointsSpent,
  selectedTalentId,
  onTalentClick,
}: TalentTrayProps) {
  const { t } = useTranslation()
  const tiers = talentsByTier(discipline.data)
  const usedTalents = new Set(
    Object.values(stones)
      .filter((stone) => stone !== undefined)
      .map((stone) => stone.talentId),
  )

  return (
    <aside className={styles.tray} aria-label={t('calculator.trayLabel')}>
      <h3 className={styles.blockTitle}>{t('calculator.tray')}</h3>
      <div className={styles.trayList}>
        {tiers.map((talents, index) => {
          const tier = index + 1
          const required = tierRequiredPoints(tier)
          const locked = pointsSpent < required
          return (
            <div className={`${styles.tier} ${locked ? styles.tierLocked : ''}`} key={tier}>
              <div className={styles.tierHead}>
                <span>{t('calculator.tier', { tier })}</span>
                {locked ? (
                  <span className={styles.tierRequirement}>
                    {t('calculator.tierLocked', { points: required })}
                  </span>
                ) : (
                  <span className={styles.tierReady}>{t('calculator.tierUnlocked')}</span>
                )}
              </div>
              <div className={styles.tierTalents}>
                {talents.map((entry) => {
                  if (!entry) return null
                  const used = usedTalents.has(entry.id)
                  const selected = selectedTalentId === entry.id
                  const className = [
                    styles.talentButton,
                    used && styles.talentUsed,
                    selected && styles.talentSelected,
                  ]
                    .filter(Boolean)
                    .join(' ')
                  return (
                    <button
                      key={entry.id}
                      type="button"
                      className={className}
                      onClick={() => onTalentClick(entry.id)}
                      aria-pressed={selected}
                      title={
                        locked
                          ? `${entry.talent.name} — ${t('calculator.tierLocked', { points: required })}`
                          : entry.talent.name
                      }
                    >
                      <span className={styles.talentIcon}>
                        <img
                          src={iconUrl(entry.talent.icon)}
                          alt=""
                          width="52"
                          height="52"
                          loading="lazy"
                          decoding="async"
                        />
                      </span>
                      <span className={styles.talentName}>{entry.talent.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </aside>
  )
}
