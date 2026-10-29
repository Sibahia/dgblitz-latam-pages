import { useTranslation } from 'react-i18next'
import { RARITY_PLATES, getItemIcon } from '@/features/armory/visuals'
import { getSourceLabel } from '@/features/armory/sourceLabel'
import type { GearItem } from '@/features/armory/types'
import styles from './armory.module.css'

interface GearItemRowProps {
  item: GearItem
  expanded: boolean
  onToggle: () => void
  onOpenSource: (sourceId: string) => void
}

export function GearItemRow({ item, expanded, onToggle, onOpenSource }: GearItemRowProps) {
  const { t } = useTranslation()
  const baseVariant = item.variants[0]
  const icon = getItemIcon(item.id)
  const sourceSummary = [...new Set(item.variants.map((variant) => variant.sourceId))]
    .map((sourceId) => getSourceLabel(sourceId, t))
    .join(' · ')

  return (
    <li className={styles.itemCard}>
      <div className={styles.itemMain}>
        <span className={styles.itemPlate} aria-hidden="true">
          <img
            className={styles.plateArt}
            src={RARITY_PLATES[baseVariant.rarity]}
            alt=""
            width="590"
            height="590"
          />
          <img className={styles.itemIcon} src={icon} alt="" width="56" height="56" />
          <span className={styles.plateLetter}>{baseVariant.rarity}</span>
        </span>
        <span className="sr-only">{t(`armory.rarity.${baseVariant.rarity}`)}</span>

        <div className={styles.itemInfo}>
          <h3>{item.name}</h3>
          <p className={styles.itemMeta}>
            {t(`armory.slots.${item.slot}`)}
            {item.subtype ? ` · ${t(`armory.subtypes.${item.subtype}`)}` : ''}
          </p>
          <p className={styles.itemSource}>{sourceSummary}</p>
        </div>

        <span className={styles.variantCount}>
          {t('armory.item.variants', { count: item.variants.length })}
        </span>

        <button
          type="button"
          className={styles.rowToggle}
          aria-expanded={expanded}
          aria-controls={`armory-variants-${item.id}`}
          onClick={onToggle}
        >
          {expanded ? t('armory.item.hideVariants') : t('armory.item.showVariants')}
        </button>
      </div>

      {expanded ? (
        <div className={styles.variantPanel} id={`armory-variants-${item.id}`}>
          <ul className={styles.variantList}>
            {item.variants.map((variant) => (
              <li key={variant.rarity} className={styles.variantRow}>
                <span className={styles.variantPlate} aria-hidden="true">
                  <img
                    className={styles.plateArt}
                    src={RARITY_PLATES[variant.rarity]}
                    alt=""
                    width="590"
                    height="590"
                  />
                  <img className={styles.variantIcon} src={icon} alt="" width="56" height="56" />
                </span>
                <span className={styles.rarityLabel}>{t(`armory.rarity.${variant.rarity}`)}</span>
                <span className={styles.variantName}>{variant.name}</span>
                <span className={styles.variantLevel}>
                  {variant.level === null
                    ? t('armory.item.noLevel')
                    : t('armory.item.level', { level: variant.level })}
                </span>
                <span className={styles.variantSource}>
                  {getSourceLabel(variant.sourceId, t)}
                </span>
                <button
                  type="button"
                  className={styles.sourceButton}
                  onClick={() => onOpenSource(variant.sourceId)}
                >
                  {t('armory.source.open')}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </li>
  )
}
