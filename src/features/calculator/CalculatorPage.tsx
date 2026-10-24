import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDocumentMeta } from '../../app/useDocumentMeta'
import { DEFAULT_DISCIPLINE_ID, DISCIPLINES, getDiscipline, TREE } from './data/meta'
import {
  addPointToSlot,
  countPoints,
  encodeBuild,
  getPointsPercent,
  isSlotUnlocked,
  isTierUnlocked,
  parseBuildHash,
  socketTalent,
  talentEntries,
  undoLastPoint,
  type StoneMap,
} from './model/calculator'
import { DetailPanel, type DetailState } from './components/DetailPanel'
import { DisciplineNav } from './components/DisciplineNav'
import { StatsPanel } from './components/StatsPanel'
import { TalentTray } from './components/TalentTray'
import { TalentTree } from './components/TalentTree'
import styles from './calculator.module.css'

interface BuildState {
  disciplineId: number
  stones: StoneMap
  history: number[]
}

function initialDisciplineId(hash: string): number {
  const raw = Number.parseInt(hash.replace('#', '').charAt(0), 10)
  return Number.isInteger(raw) && raw >= 0 && raw < DISCIPLINES.length ? raw : DEFAULT_DISCIPLINE_ID
}

function initialBuild(hash: string): BuildState {
  const disciplineId = initialDisciplineId(hash)
  const parsed = parseBuildHash(hash, getDiscipline(disciplineId).data, TREE)
  const stones = parsed?.stones ?? {}
  const history: number[] = []
  for (const [key, stone] of Object.entries(stones)) {
    if (!stone) continue
    const slotId = Number(key)
    for (let index = 0; index <= stone.talentLevel; index += 1) history.push(slotId)
  }
  return { disciplineId, stones, history }
}

export function CalculatorPage() {
  const { t } = useTranslation()
  useDocumentMeta(t('calculator.metaTitle'), t('calculator.metaDescription'))

  const [build, setBuild] = useState<BuildState>(() => initialBuild(window.location.hash))
  const [selectedTalentId, setSelectedTalentId] = useState<number | null>(null)
  const [detail, setDetail] = useState<DetailState>({ kind: 'hint' })
  const [resetOpen, setResetOpen] = useState(false)
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle')
  const dialogRef = useRef<HTMLDialogElement>(null)

  const discipline = getDiscipline(build.disciplineId)
  const pointsSpent = countPoints(build.stones)
  const pointsPercent = getPointsPercent(pointsSpent, TREE)
  const entries = talentEntries(discipline.data)
  const selectedTier =
    selectedTalentId === null ? null : (discipline.data.talents[selectedTalentId]?.tier[0] ?? null)
  const activeTalentId =
    selectedTier !== null && isTierUnlocked(selectedTier, pointsSpent) ? selectedTalentId : null

  useEffect(() => {
    window.history.replaceState(null, '', encodeBuild(build.disciplineId, build.stones, TREE))
  }, [build.disciplineId, build.stones])

  useEffect(() => {
    if (copyState === 'idle') return undefined
    const timer = window.setTimeout(() => setCopyState('idle'), 2200)
    return () => window.clearTimeout(timer)
  }, [copyState])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (resetOpen && !dialog.open) dialog.showModal()
    if (!resetOpen && dialog.open) dialog.close()
  }, [resetOpen])

  function changeDiscipline(disciplineId: number) {
    if (disciplineId === build.disciplineId) return
    setBuild({ disciplineId, stones: {}, history: [] })
    setSelectedTalentId(null)
    setDetail({ kind: 'hint' })
  }

  function handleAddPoint(slotId: number) {
    setBuild((previous) => {
      const next = addPointToSlot(slotId, previous.stones, countPoints(previous.stones), TREE)
      if (next === previous.stones) return previous
      return { ...previous, stones: next, history: [...previous.history, slotId] }
    })
  }

  function handleSlotClick(slotId: number) {
    const stone = build.stones[slotId]
    if (stone) {
      setDetail({ kind: 'talent', talentId: stone.talentId })
      handleAddPoint(slotId)
      return
    }

    if (!isSlotUnlocked(slotId, build.stones, pointsSpent, TREE)) {
      setDetail({ kind: 'slot', slotId, locked: true })
      return
    }

    if (activeTalentId !== null) {
      const entry = entries.find((item) => item.id === activeTalentId)
      if (!entry) return
      const next = socketTalent(entry, slotId, build.stones, build.history, pointsSpent, TREE)
      if (next) {
        setBuild((previous) => ({ ...previous, stones: next.stones, history: next.history }))
        setSelectedTalentId(null)
        setDetail({ kind: 'talent', talentId: entry.id })
      } else {
        setDetail({ kind: 'slot', slotId, locked: false })
      }
      return
    }

    setDetail({ kind: 'slot', slotId, locked: false })
  }

  function handleTalentClick(talentId: number) {
    setDetail({ kind: 'talent', talentId })
    const talent = discipline.data.talents[talentId]
    if (!talent || !isTierUnlocked(talent.tier[0], pointsSpent)) {
      setSelectedTalentId(null)
      return
    }
    const used = Object.values(build.stones).some((stone) => stone?.talentId === talentId)
    setSelectedTalentId((previous) => (used || previous === talentId ? null : talentId))
  }

  function handleUndo() {
    setBuild((previous) => {
      const next = undoLastPoint(previous.history, previous.stones)
      return { ...previous, stones: next.stones, history: next.history }
    })
    setSelectedTalentId(null)
  }

  function handleReset() {
    setBuild((previous) => ({ ...previous, stones: {}, history: [] }))
    setSelectedTalentId(null)
    setDetail({ kind: 'hint' })
    setResetOpen(false)
  }

  async function copyLink() {
    try {
      if (!navigator.clipboard) throw new Error('clipboard-unavailable')
      await navigator.clipboard.writeText(window.location.href)
      setCopyState('copied')
    } catch {
      setCopyState('error')
    }
  }

  const toast =
    copyState === 'copied'
      ? t('calculator.linkCopied')
      : copyState === 'error'
        ? t('calculator.linkCopyError')
        : ''

  return (
    <div className={styles.page}>
      <header className={`container ${styles.pageHead}`}>
        <p className="eyebrow">{t('calculator.eyebrow')}</p>
        <h1>{t('calculator.title')}</h1>
        <p className={styles.pageLead}>{t('calculator.lead')}</p>
      </header>

      <DisciplineNav disciplineId={build.disciplineId} onSelect={changeDiscipline} />

      <div className={`container ${styles.window}`}>
        <StatsPanel discipline={discipline} stones={build.stones} pointsSpent={pointsSpent} />

        <div className={styles.centerColumn}>
          <TalentTree
            discipline={discipline}
            stones={build.stones}
            pointsSpent={pointsSpent}
            onSlotClick={handleSlotClick}
            onSkillClick={(skillId) => setDetail({ kind: 'skill', skillId })}
          />
          <DetailPanel
            discipline={discipline}
            stones={build.stones}
            detail={detail}
            pointsSpent={pointsSpent}
            onAddPoint={handleAddPoint}
          />
        </div>

        <TalentTray
          discipline={discipline}
          stones={build.stones}
          pointsSpent={pointsSpent}
          selectedTalentId={activeTalentId}
          onTalentClick={handleTalentClick}
        />
      </div>

      <div className={`container ${styles.toolbarWrap}`}>
        <div className={styles.toolbar}>
          <div className={styles.toolbarPoints}>
            <span className={styles.blockLabel}>{t('calculator.pointsSpent')}</span>
            <strong>
              {pointsSpent}
              <em>/{TREE.maxPoints}</em>
            </strong>
            <div className={styles.meter}>
              <span style={{ width: `${pointsPercent}%` }} />
            </div>
          </div>
          <div className={styles.toolbarActions}>
            <button
              type="button"
              className="button button--ghost button--small"
              onClick={handleUndo}
              disabled={build.history.length === 0}
            >
              {t('calculator.undo')}
            </button>
            <button
              type="button"
              className="button button--ghost button--small"
              onClick={() => setResetOpen(true)}
              disabled={pointsSpent === 0}
            >
              {t('calculator.reset')}
            </button>
            <button
              type="button"
              className="button button--primary button--small"
              onClick={copyLink}
            >
              {t('calculator.copyLink')}
            </button>
          </div>
        </div>
      </div>

      <dialog
        ref={dialogRef}
        className={styles.dialog}
        aria-labelledby="reset-title"
        onCancel={() => setResetOpen(false)}
        onClose={() => setResetOpen(false)}
      >
        <h2 id="reset-title">{t('calculator.resetConfirm')}</h2>
        <p>{t('calculator.resetConfirmHint')}</p>
        <div className={styles.dialogActions}>
          <button
            type="button"
            className="button button--ghost"
            onClick={() => setResetOpen(false)}
          >
            {t('calculator.cancel')}
          </button>
          <button type="button" className="button button--primary" onClick={handleReset}>
            {t('calculator.confirmReset')}
          </button>
        </div>
      </dialog>

      <div className={styles.toast} role="status" aria-live="polite">
        {toast}
      </div>
    </div>
  )
}
