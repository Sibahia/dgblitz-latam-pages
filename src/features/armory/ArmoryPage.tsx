import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { useDocumentMeta } from '@/app/useDocumentMeta'
import { useLocale } from '@/app/useLocale'
import mageCard from '@/assets/game/armory/ui/a_ClassCardMage.webp?url&no-inline'
import paladinCard from '@/assets/game/armory/ui/a_ClassCardPaladin.webp?url&no-inline'
import rogueCard from '@/assets/game/armory/ui/a_ClassCardRogue.webp?url&no-inline'
import { ARMORY_CLASSES } from '@/features/armory/data/constants'
import { loadArmoryClass } from '@/features/armory/data/load'
import { ARMORY_MANIFEST } from '@/features/armory/data/meta'
import { GearItemRow } from '@/features/armory/GearItemRow'
import { SourceDialog } from '@/features/armory/SourceDialog'
import type {
  ArmoryClass,
  ArmoryClassData,
  GearSlot,
  GearSubtype,
} from '@/features/armory/types'
import styles from './armory.module.css'

const DEFAULT_CLASS: ArmoryClass = 'paladin'
const DEFAULT_SLOT: GearSlot = 'weapon'
const SLICE_LIMIT = 3

const GEAR_SLOTS = [
  'weapon',
  'offhand',
  'head',
  'armor',
  'gloves',
  'boots',
] as const satisfies readonly GearSlot[]

const GEAR_SUBTYPES = [
  'axe',
  'mace',
  'sword',
  'saber',
  'scepter',
  'rapier',
  'staff',
] as const satisfies readonly GearSubtype[]

const CLASS_CARDS: Record<ArmoryClass, string> = {
  paladin: paladinCard,
  rogue: rogueCard,
  mage: mageCard,
}

type ClassLoadState =
  | { className: ArmoryClass; status: 'ready'; data: ArmoryClassData }
  | { className: ArmoryClass; status: 'error' }

function isArmoryClass(value: string | null): value is ArmoryClass {
  return value !== null && (ARMORY_CLASSES as readonly string[]).includes(value)
}

function isGearSlot(value: string | null): value is GearSlot {
  return value !== null && (GEAR_SLOTS as readonly string[]).includes(value)
}

function isGearSubtype(value: string | null): value is GearSubtype {
  return value !== null && (GEAR_SUBTYPES as readonly string[]).includes(value)
}

export function ArmoryPage() {
  const { t } = useTranslation()
  const { locale } = useLocale()
  const [searchParams, setSearchParams] = useSearchParams()
  useDocumentMeta(t('armory.metaTitle'), t('armory.metaDescription'))

  const requestedClass = searchParams.get('clase')
  const activeClass = isArmoryClass(requestedClass) ? requestedClass : DEFAULT_CLASS
  const requestedSlot = searchParams.get('ranura')
  const activeSlot = isGearSlot(requestedSlot) ? requestedSlot : DEFAULT_SLOT
  const requestedSubtype = searchParams.get('tipo')
  const rawQuery = searchParams.get('q') ?? ''
  const query = rawQuery.trim().toLowerCase()

  const [classLoad, setClassLoad] = useState<ClassLoadState | null>(null)
  const [expandedIds, setExpandedIds] = useState<ReadonlySet<number>>(new Set())
  const [dialogSourceId, setDialogSourceId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    loadArmoryClass(activeClass)
      .then((data) => {
        if (cancelled) return
        setClassLoad({ className: activeClass, status: 'ready', data })
      })
      .catch(() => {
        if (cancelled) return
        setClassLoad({ className: activeClass, status: 'error' })
      })

    return () => {
      cancelled = true
    }
  }, [activeClass])

  const classData =
    classLoad?.className === activeClass && classLoad.status === 'ready' ? classLoad.data : null
  const loadState =
    classLoad?.className === activeClass ? classLoad.status : ('loading' as const)

  const stats = ARMORY_MANIFEST.classes[activeClass]
  const classLabel = t(`armory.classes.${activeClass}`)
  const slotLabel = t(`armory.slots.${activeSlot}`)
  const numberFormat = new Intl.NumberFormat(locale)

  const slotItems = classData?.items.filter((item) => item.slot === activeSlot) ?? []
  const availableSubtypes = [
    ...new Set(
      slotItems
        .map((item) => item.subtype)
        .filter((subtype): subtype is GearSubtype => subtype !== null),
    ),
  ].sort()
  const activeSubtype =
    isGearSubtype(requestedSubtype) && availableSubtypes.includes(requestedSubtype)
      ? requestedSubtype
      : null

  const filteredItems = slotItems.filter((item) => {
    if (activeSubtype && item.subtype !== activeSubtype) return false
    if (!query) return true
    const haystack = [item.name, ...item.variants.map((variant) => variant.name)]
      .join(' ')
      .toLowerCase()
    return haystack.includes(query)
  })
  const visibleItems = filteredItems.slice(0, SLICE_LIMIT)

  function selectClass(className: ArmoryClass) {
    if (className === activeClass) return
    const next = new URLSearchParams(searchParams)
    next.set('clase', className)
    next.delete('tipo')
    setExpandedIds(new Set())
    setSearchParams(next, { replace: true })
  }

  function selectSlot(slot: GearSlot) {
    if (slot === activeSlot) return
    const next = new URLSearchParams(searchParams)
    if (slot === DEFAULT_SLOT) {
      next.delete('ranura')
    } else {
      next.set('ranura', slot)
    }
    next.delete('tipo')
    setExpandedIds(new Set())
    setSearchParams(next, { replace: true })
  }

  function selectSubtype(subtype: GearSubtype | null) {
    const next = new URLSearchParams(searchParams)
    if (subtype) {
      next.set('tipo', subtype)
    } else {
      next.delete('tipo')
    }
    setExpandedIds(new Set())
    setSearchParams(next, { replace: true })
  }

  function updateQuery(value: string) {
    const next = new URLSearchParams(searchParams)
    if (value.trim()) {
      next.set('q', value)
    } else {
      next.delete('q')
    }
    setSearchParams(next, { replace: true })
  }

  function clearFilters() {
    const next = new URLSearchParams(searchParams)
    for (const key of ['q', 'ranura', 'tipo', 'rareza', 'fuente']) {
      next.delete(key)
    }
    setExpandedIds(new Set())
    setSearchParams(next, { replace: true })
  }

  function toggleExpanded(itemId: number) {
    setExpandedIds((current) => {
      const next = new Set(current)
      if (next.has(itemId)) {
        next.delete(itemId)
      } else {
        next.add(itemId)
      }
      return next
    })
  }

  return (
    <div className={styles.page}>
      <header className={`container ${styles.pageHead}`}>
        <p className="eyebrow">{t('armory.eyebrow')}</p>
        <h1>{t('armory.title')}</h1>
        <p className={styles.pageLead}>{t('armory.lead')}</p>
      </header>

      <div className={`container ${styles.classShell}`}>
        <div className={`${styles.stonePanel} ${styles.classRow}`}>
          <div className={styles.classIntro}>
            <h2 id="armory-class-heading">{t('armory.classLabel')}</h2>
            <p>{t('armory.classHint')}</p>
          </div>

          <div className={styles.classList} role="group" aria-labelledby="armory-class-heading">
            {ARMORY_CLASSES.map((className) => {
              const active = className === activeClass
              const classStats = ARMORY_MANIFEST.classes[className]
              const label = t(`armory.classes.${className}`)

              return (
                <button
                  key={className}
                  type="button"
                  className={`${styles.classButton} ${active ? styles.classButtonActive : ''}`}
                  aria-label={label}
                  aria-pressed={active}
                  onClick={() => selectClass(className)}
                >
                  <img
                    className={styles.classCardArt}
                    src={CLASS_CARDS[className]}
                    alt=""
                    width="900"
                    height="500"
                  />
                  <span className={styles.classCardContent} aria-hidden="true">
                    <span className={styles.className}>{label}</span>
                    <span className={styles.classMeta}>
                      {numberFormat.format(classStats.bases)} {t('armory.preview.basesShort')}
                      {' · '}
                      {numberFormat.format(classStats.variants)}{' '}
                      {t('armory.preview.variantsShort')}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <section
          className={`${styles.stonePanel} ${styles.armoryShell}`}
          aria-labelledby="armory-browser-title"
        >
          <div className={styles.shellTop}>
            <div className={styles.shellIntro}>
              <p className={styles.shellKicker}>
                {t('armory.browser.context', { className: classLabel, slot: slotLabel })}
              </p>
              <h2 id="armory-browser-title">{t('armory.browser.title')}</h2>
              <p className={styles.shellText}>{t('armory.browser.lead')}</p>
            </div>

            <dl className={styles.shellStats}>
              <div>
                <dt>{t('armory.stats.bases')}</dt>
                <dd>{numberFormat.format(stats.bases)}</dd>
              </div>
              <div>
                <dt>{t('armory.stats.variants')}</dt>
                <dd>{numberFormat.format(stats.variants)}</dd>
              </div>
            </dl>
          </div>

          <div className={styles.toolbar}>
            <label className={styles.searchField}>
              <span className={styles.fieldLabel}>{t('armory.search.label')}</span>
              <input
                className={styles.searchInput}
                type="search"
                value={rawQuery}
                placeholder={t('armory.search.placeholder')}
                onChange={(event) => updateQuery(event.target.value)}
              />
            </label>

            <div className={styles.slotRack} role="group" aria-label={t('armory.slots.label')}>
              {GEAR_SLOTS.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  className={styles.slotButton}
                  aria-pressed={slot === activeSlot}
                  onClick={() => selectSlot(slot)}
                >
                  <span className={styles.slotName}>{t(`armory.slots.${slot}`)}</span>
                  <span className={styles.slotCount}>
                    {numberFormat.format(stats.slots[slot])}
                  </span>
                </button>
              ))}
            </div>

            {availableSubtypes.length > 0 ? (
              <div
                className={styles.subtypeRow}
                role="group"
                aria-label={t('armory.subtypes.label')}
              >
                <button
                  type="button"
                  className={styles.chip}
                  aria-pressed={activeSubtype === null}
                  onClick={() => selectSubtype(null)}
                >
                  {t('armory.subtypes.all')}
                </button>
                {availableSubtypes.map((subtype) => (
                  <button
                    key={subtype}
                    type="button"
                    className={styles.chip}
                    aria-pressed={activeSubtype === subtype}
                    onClick={() => selectSubtype(subtype)}
                  >
                    {t(`armory.subtypes.${subtype}`)}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className={styles.resultsBar}>
            <p className={styles.resultsCount} aria-live="polite">
              {t('armory.results.count', {
                count: filteredItems.length,
                total: slotItems.length,
              })}
            </p>
            {filteredItems.length > SLICE_LIMIT ? (
              <p className={styles.sliceNote}>
                {t('armory.results.slice', {
                  shown: visibleItems.length,
                  total: filteredItems.length,
                })}
              </p>
            ) : null}
            <button type="button" className={styles.clearButton} onClick={clearFilters}>
              {t('armory.results.clear')}
            </button>
          </div>

          {loadState === 'loading' ? (
            <p className={styles.stateMessage}>{t('common.loading')}</p>
          ) : null}
          {loadState === 'error' ? (
            <p className={styles.stateMessage} role="alert">
              {t('armory.results.error')}
            </p>
          ) : null}
          {loadState === 'ready' && filteredItems.length === 0 ? (
            <p className={styles.stateMessage}>{t('armory.results.empty')}</p>
          ) : null}
          {loadState === 'ready' && visibleItems.length > 0 ? (
            <ul className={styles.itemList}>
              {visibleItems.map((item) => (
                <GearItemRow
                  key={item.id}
                  item={item}
                  expanded={expandedIds.has(item.id)}
                  onToggle={() => toggleExpanded(item.id)}
                  onOpenSource={setDialogSourceId}
                />
              ))}
            </ul>
          ) : null}
        </section>
      </div>

      <SourceDialog sourceId={dialogSourceId} onClose={() => setDialogSourceId(null)} />
    </div>
  )
}
