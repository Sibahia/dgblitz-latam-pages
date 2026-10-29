import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { getGearSource } from '@/features/armory/data/meta'
import styles from './armory.module.css'

interface SourceDialogProps {
  sourceId: string | null
  onClose: () => void
}

export function SourceDialog({ sourceId, onClose }: SourceDialogProps) {
  const { t } = useTranslation()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const source = sourceId ? getGearSource(sourceId) : undefined

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (sourceId) {
      if (!dialog.open) {
        try {
          dialog.showModal()
        } catch {
          dialog.setAttribute('open', '')
        }
      }
      return
    }

    if (dialog.open) {
      try {
        dialog.close()
      } catch {
        dialog.removeAttribute('open')
      }
    }
  }, [sourceId])

  const dungeon =
    source && (source.kind === 'boss' || source.kind === 'realm') ? source.dungeon : null
  const missions =
    source && (source.kind === 'boss' || source.kind === 'realm') ? source.missions : []

  const title =
    source?.kind === 'boss'
      ? source.boss
      : source?.kind === 'realm'
        ? `${source.realm} · ${t('common.level')} ${source.level}`
        : source
          ? t(`armory.source.kinds.${source.kind}`)
          : ''

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby="armory-source-title"
      onClose={onClose}
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose()
      }}
    >
      {source ? (
        <div className={`${styles.stonePanel} ${styles.dialogPanel}`}>
          <div className={styles.dialogHead}>
            <div>
              <p className={styles.dialogKicker}>{t('armory.source.title')}</p>
              <h2 id="armory-source-title">{title}</h2>
            </div>
            <button
              type="button"
              className={styles.dialogClose}
              aria-label={t('common.close')}
              onClick={onClose}
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>

          <dl className={styles.sourceDetails}>
            <div>
              <dt>{t('armory.source.kind')}</dt>
              <dd>{t(`armory.source.kinds.${source.kind}`)}</dd>
            </div>
            {source.kind === 'boss' ? (
              <div>
                <dt>{t('armory.source.boss')}</dt>
                <dd>{source.boss}</dd>
              </div>
            ) : null}
            {source.kind === 'realm' ? (
              <>
                <div>
                  <dt>{t('armory.source.realm')}</dt>
                  <dd>{source.realm}</dd>
                </div>
                <div>
                  <dt>{t('common.level')}</dt>
                  <dd>{source.level}</dd>
                </div>
              </>
            ) : null}
            {dungeon ? (
              <div>
                <dt>{t('armory.source.dungeon')}</dt>
                <dd>{dungeon.name}</dd>
              </div>
            ) : null}
          </dl>

          <div className={styles.missions}>
            <h3>{t('armory.source.missions')}</h3>
            {missions.length > 0 ? (
              <ul>
                {missions.map((mission) => (
                  <li key={mission}>{mission}</li>
                ))}
              </ul>
            ) : (
              <p>{t('armory.source.noMissions')}</p>
            )}
          </div>

          <button type="button" className={styles.dialogCloseButton} onClick={onClose}>
            {t('common.close')}
          </button>
        </div>
      ) : null}
    </dialog>
  )
}
