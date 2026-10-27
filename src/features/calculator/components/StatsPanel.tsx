import { useTranslation } from 'react-i18next'
import {
  computeStats,
  getExperiencePercent,
  getPointsPercent,
  getRequiredLevel,
  getRequiredTotemLevel,
  type StoneMap,
} from '@/features/calculator/model/calculator'
import { iconUrl, TREE, type DisciplineMeta } from '@/features/calculator/data/meta'
import styles from '@/features/calculator/calculator.module.css'

interface StatsPanelProps {
  discipline: DisciplineMeta
  stones: StoneMap
  pointsSpent: number
}

export function StatsPanel({ discipline, stones, pointsSpent }: StatsPanelProps) {
  const { t } = useTranslation()
  const stats = computeStats(discipline.data, stones)
  const pointsPercent = getPointsPercent(pointsSpent, TREE)
  const experiencePercent = getExperiencePercent(pointsSpent)

  return (
    <aside className={styles.statsPanel} aria-label={t('calculator.statsLabel')}>
      <div className={styles.panelHead}>
        <img
          src={discipline.portraitSmall}
          alt=""
          width="96"
          height="96"
          loading="lazy"
          decoding="async"
        />
        <div>
          <strong>{discipline.name}</strong>
          <span>{discipline.className}</span>
        </div>
      </div>

      <div className={styles.pointsBlock}>
        <span className={styles.blockLabel}>{t('calculator.pointsSpent')}</span>
        <strong className={styles.pointsValue}>
          {pointsSpent}
          <em>/{TREE.maxPoints}</em>
        </strong>
        <div className={styles.meter}>
          <span style={{ width: `${pointsPercent}%` }} />
        </div>
      </div>

      <dl className={styles.buildMeta}>
        <div>
          <dt>{t('calculator.requiredLevel')}</dt>
          <dd>{getRequiredLevel(pointsSpent)}</dd>
        </div>
        <div>
          <dt>{t('calculator.requiredTotem')}</dt>
          <dd>{getRequiredTotemLevel(pointsSpent)}</dd>
        </div>
      </dl>

      <div className={styles.expBlock}>
        <div className={styles.expHead}>
          <span className={styles.blockLabel}>{t('calculator.experience')}</span>
          <span className={styles.expValue}>70</span>
        </div>
        <div className={`${styles.meter} ${styles.meterExp}`}>
          <span style={{ width: `${experiencePercent}%` }} />
        </div>
      </div>

      <h3 className={styles.blockTitle}>{t('calculator.stats')}</h3>
      {pointsSpent === 0 ? (
        <p className={styles.emptyNote}>{t('calculator.noStats')}</p>
      ) : (
        <ul className={styles.statList}>
          {stats.map((stat) => (
            <li key={stat.statId} className={styles.statRow}>
              {stat.icon ? (
                <span className={styles.statIcon}>
                  <img
                    src={iconUrl(stat.icon)}
                    alt=""
                    width="52"
                    height="52"
                    loading="lazy"
                    decoding="async"
                  />
                </span>
              ) : null}
              <span className={styles.statName}>{stat.name}</span>
              <strong className={styles.statValue}>{stat.value}</strong>
            </li>
          ))}
        </ul>
      )}
    </aside>
  )
}
