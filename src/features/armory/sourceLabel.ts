import type { TFunction } from 'i18next'
import { getGearSource } from '@/features/armory/data/meta'

export function getSourceLabel(sourceId: string, t: TFunction): string {
  const source = getGearSource(sourceId)
  if (!source) return sourceId

  switch (source.kind) {
    case 'boss':
      return t('armory.sources.boss', { boss: source.boss })
    case 'realm':
      return t('armory.sources.realm', { realm: source.realm, level: source.level })
    case 'starter':
      return t('armory.sources.starter')
    case 'global':
      return t('armory.sources.global')
  }
}
