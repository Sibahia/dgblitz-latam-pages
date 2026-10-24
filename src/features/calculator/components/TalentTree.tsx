import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
  getSkillSpritePosition,
  getSkillStates,
  getUnlockedSlots,
  MAX_TALENT_LEVEL,
  type StoneMap,
} from '../model/calculator'
import { iconUrl, TREE, UI, type DisciplineMeta } from '../data/meta'
import styles from '../calculator.module.css'

interface TalentTreeProps {
  discipline: DisciplineMeta
  stones: StoneMap
  pointsSpent: number
  onSlotClick: (slotId: number) => void
  onSkillClick: (skillId: number) => void
}

export function TalentTree({
  discipline,
  stones,
  pointsSpent,
  onSlotClick,
  onSkillClick,
}: TalentTreeProps) {
  const { t } = useTranslation()
  const viewportRef = useRef<HTMLDivElement>(null)
  const unlockedSlots = getUnlockedSlots(stones, pointsSpent)
  const skillStates = getSkillStates(stones, pointsSpent)

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    const maxScroll = viewport.scrollWidth - viewport.clientWidth
    if (maxScroll > 0) viewport.scrollLeft = maxScroll / 2
  }, [discipline.id])

  return (
    <section
      className={styles.treeSection}
      aria-label={t('calculator.treeLabel', { discipline: discipline.name })}
    >
      <p className={styles.treeHint}>
        {t('calculator.treeInstruction')}
        <span className={styles.treeScrollHint}>{t('calculator.treeScrollHint')}</span>
      </p>
      <div
        ref={viewportRef}
        className={styles.treeViewport}
        tabIndex={0}
        role="group"
        aria-label={t('calculator.tree')}
      >
        <div className={styles.treeCanvas}>
          <img className={styles.treePortrait} src={discipline.portrait} alt="" loading="lazy" />
          <img className={styles.treeArt} src={UI.treeArt} alt="" />
          {TREE.talentSlots.map((slot) => {
            const stone = stones[slot.id]
            const talent = stone ? discipline.data.talents[stone.talentId] : undefined
            const capacity = Math.min(slot.capacity, MAX_TALENT_LEVEL)
            const unlocked = unlockedSlots.has(slot.id)

            let label: string
            if (stone && talent) {
              label = `${talent.name} — ${t('calculator.socketLevel', {
                level: stone.talentLevel + 1,
                capacity,
              })}`
            } else if (!unlocked) {
              label = `${t('calculator.lockedSocket')} — ${t('calculator.lockedSocketHint')}`
            } else {
              label = `${t('calculator.emptySocket')} — ${t('calculator.socketLevel', {
                level: 0,
                capacity,
              })}`
            }

            const className = [
              styles.slot,
              stone && styles.slotFilled,
              !stone && !unlocked && styles.slotLocked,
            ]
              .filter(Boolean)
              .join(' ')

            return (
              <button
                key={slot.id}
                type="button"
                className={className}
                style={{ left: slot.pos[0] - 20, top: slot.pos[1] - 20 }}
                onClick={() => onSlotClick(slot.id)}
                aria-label={label}
                title={label}
              >
                {stone && talent ? (
                  <>
                    <img className={styles.slotIcon} src={iconUrl(talent.icon)} alt="" />
                    <span className={styles.slotLevel}>
                      {stone.talentLevel + 1}/{capacity}
                    </span>
                  </>
                ) : !unlocked ? (
                  <img className={styles.slotClosed} src={UI.closedSlot} alt="" />
                ) : (
                  <span className={styles.slotCapacity}>{capacity}</span>
                )}
              </button>
            )
          })}

          {TREE.skillSlots.map((skillSlot, skillId) => {
            const skill = discipline.data.skills[skillId]
            const state = skillStates[skillId]
            if (!skill || !state) return null
            const position = getSkillSpritePosition(skillId, discipline.id, state.unlocked)
            return (
              <button
                key={skillId}
                type="button"
                className={`${styles.skillSlot} ${state.unlocked ? styles.skillUnlocked : styles.skillLocked}`}
                style={{
                  left: skillSlot.pos[0] - 32,
                  top: skillSlot.pos[1] - 32,
                  backgroundImage: `url(${UI.skillSprite})`,
                  backgroundPosition: `${position.x}px ${position.y}px`,
                }}
                onClick={() => onSkillClick(skillId)}
                aria-label={`${skill.name} — ${
                  state.unlocked ? t('common.unlocked') : t('common.locked')
                }`}
                title={skill.name}
              />
            )
          })}
        </div>
      </div>
    </section>
  )
}
