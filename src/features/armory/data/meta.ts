import manifestData from './manifest.json'
import sourcesData from './sources.json'
import type { ArmoryManifest, ArmorySourcesData, GearSource } from '@/features/armory/types'

export const ARMORY_SOURCES: Record<string, GearSource> = (
  sourcesData as ArmorySourcesData
).sources

export const ARMORY_MANIFEST = manifestData as ArmoryManifest

export function getGearSource(sourceId: string): GearSource | undefined {
  return ARMORY_SOURCES[sourceId]
}
