import { useTranslation } from 'react-i18next'
import {
  getSkillSpritePosition,
  getSkillStates,
  isSlotUnlocked,
  MAX_TALENT_LEVEL,
  type StoneMap,
} from '@/features/calculator/model/calculator'
import { iconUrl, TREE, UI, type DisciplineMeta } from '@/features/calculator/data/meta'
import type { Talent } from '@/features/calculator/data/types'
import styles from '@/features/calculator/calculator.module.css'

export type DetailState =
  | { kind: 'hint' }
  | { kind: 'talent'; talentId: number }
  | { kind: 'skill'; skillId: number }
  | { kind: 'slot'; slotId: number; locked: boolean }

interface DetailPanelProps {
  discipline: DisciplineMeta
  stones: StoneMap
  detail: DetailState
  pointsSpent: number
  onAddPoint: (slotId: number) => void
}

function talentRows(talent: Talent) {
  const parameters = Array.isArray(talent.parameter) ? talent.parameter : [talent.parameter]
  const values = (
    Array.isArray(talent.parameter) ? (talent.values as string[][]) : [talent.values as string[]]
  ) as string[][]
  return parameters.map((parameter, index) => ({
    parameter,
    values: values[index] ?? [],
  }))
}

export function DetailPanel({
  discipline,
  stones,
  detail,
  pointsSpent,
  onAddPoint,
}: DetailPanelProps) {
  const { t } = useTranslation()

  if (detail.kind === 'talent') {
    const talent = discipline.data.talents[detail.talentId]
    if (!talent) return null
    const entry = Object.entries(stones).find(([, stone]) => stone?.talentId === detail.talentId)
    const slotId = entry ? Number(entry[0]) : null
    const stone = entry?.[1]
    const capacity = slotId === null ? MAX_TALENT_LEVEL : Math.min(TREE.talentSlots[slotId]?.capacity ?? MAX_TALENT_LEVEL, MAX_TALENT_LEVEL)
    const level = stone ? stone.talentLevel : 0
    const canAdd = Boolean(stone) && level + 1 < capacity && pointsSpent < TREE.maxPoints

    return (
      <section className={styles.detail} aria-live="polite">
        <div className={styles.detailHead}>
          <span className={styles.detailIcon}>
            <img
              src={iconUrl(talent.icon)}
              alt=""
              width="52"
              height="52"
              loading="lazy"
              decoding="async"
            />
          </span>
          <div>
            <strong>{talent.name}</strong>
            <span>
              {t('calculator.tier', { tier: talent.tier[0] })} ·{' '}
              {Array.isArray(talent.parameter) ? talent.parameter.join(' / ') : talent.parameter}
            </span>
          </div>
          {stone ? (
            <span className={styles.detailLevel}>
              {t('calculator.socketLevel', { level: level + 1, capacity })}
            </span>
          ) : null}
        </div>
        <p className={styles.detailDescription}>{talent.description}</p>
        <ul className={styles.valueList}>
          {talentRows(talent).map((row) => (
            <li key={row.parameter}>
              <span>{row.parameter}</span>
              <strong>{row.values[level] ?? '—'}</strong>
              <em>{row.values.join(' → ')}</em>
            </li>
          ))}
        </ul>
        {stone && slotId !== null ? (
          <div className={styles.detailActions}>
            <button
              type="button"
              className={`button button--small ${canAdd ? 'button--primary' : 'button--ghost'}`}
              onClick={() => onAddPoint(slotId)}
              disabled={!canAdd}
            >
              {canAdd
                ? t('calculator.socketLevel', { level: level + 2, capacity })
                : t('calculator.socketLevel', { level: level + 1, capacity })}
            </button>
          </div>
        ) : (
          <p className={styles.detailHint}>
            <span className={styles.hintDesktop}>{t('calculator.selectTalentHint')}</span>
            <span className={styles.hintMobile}>{t('calculator.selectTalentHintMobile')}</span>
          </p>
        )}
      </section>
    )
  }

  if (detail.kind === 'skill') {
    const skill = discipline.data.skills[detail.skillId]
    if (!skill) return null
    const state = getSkillStates(stones, pointsSpent)[detail.skillId]
    const spritePosition = getSkillSpritePosition(detail.skillId, state?.unlocked ?? false)
    const iconScale = 46 / 65
    return (
      <section className={styles.detail} aria-live="polite">
        <div className={styles.detailHead}>
          <span
            className={styles.detailIcon}
            style={{
              backgroundImage: `url(${UI.skillSheets[discipline.id]})`,
              backgroundSize: `${195 * iconScale}px ${130 * iconScale}px`,
              backgroundPosition: `${spritePosition.x * iconScale}px ${spritePosition.y * iconScale}px`,
            }}
          />
          <div>
            <strong>{skill.name}</strong>
            <span>{t('calculator.skills')}</span>
          </div>
          {state ? (
            <span className={styles.detailLevel}>
              {state.unlocked ? t('common.unlocked') : t('common.locked')}
            </span>
          ) : null}
        </div>
        <p className={styles.detailDescription}>{skill.description}</p>
        {state && !state.unlocked ? (
          <p className={styles.detailHint}>
            {state.pointsRemaining > 0
              ? t('calculator.skillPointsLocked', { points: state.pointsRemaining })
              : t('calculator.skillConnectedLocked')}
          </p>
        ) : (
          <p className={styles.detailHint}>{t('calculator.skillUnlocked')}</p>
        )}
      </section>
    )
  }

  if (detail.kind === 'slot') {
    const slot = TREE.talentSlots[detail.slotId]
    if (!slot) return null
    const unlocked = isSlotUnlocked(detail.slotId, stones, pointsSpent)
    return (
      <section className={styles.detail} aria-live="polite">
        <div className={styles.detailHead}>
          <span className={styles.detailIcon}>
            <img
              src={UI.closedSlot}
              alt=""
              width="36"
              height="36"
              loading="lazy"
              decoding="async"
            />
          </span>
          <div>
            <strong>{unlocked ? t('calculator.emptySocket') : t('calculator.lockedSocket')}</strong>
            <span>{t('calculator.socketLevel', { level: 0, capacity: slot.capacity })}</span>
          </div>
        </div>
        <p className={styles.detailHint}>
          {unlocked ? t('calculator.emptySocketHint') : t('calculator.lockedSocketHint')}
        </p>
      </section>
    )
  }

  return (
    <section className={styles.detail} aria-live="polite">
      <p className={styles.detailHint}>
        <span className={styles.hintDesktop}>{t('calculator.selectTalentHint')}</span>
        <span className={styles.hintMobile}>{t('calculator.selectTalentHintMobile')}</span>
      </p>
    </section>
  )
}
