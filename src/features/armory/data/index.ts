import mageData from './mage.json'
import manifestData from './manifest.json'
import paladinData from './paladin.json'
import rogueData from './rogue.json'
import sourcesData from './sources.json'
import type {
  ArmoryClass,
  ArmoryClassData,
  ArmoryManifest,
  ArmorySourcesData,
  GearItem,
  GearSource,
} from '../types'

export const ARMORY_CLASSES = ['paladin', 'rogue', 'mage'] as const satisfies readonly ArmoryClass[]

export const ARMORY_DATA: Record<ArmoryClass, ArmoryClassData> = {
  paladin: paladinData as ArmoryClassData,
  rogue: rogueData as ArmoryClassData,
  mage: mageData as ArmoryClassData,
}

export const ARMORY_SOURCES: Record<string, GearSource> = (
  sourcesData as ArmorySourcesData
).sources

export const ARMORY_MANIFEST = manifestData as ArmoryManifest

export function getArmoryClass(className: ArmoryClass): ArmoryClassData {
  return ARMORY_DATA[className]
}

export function getGearItem(className: ArmoryClass, itemId: number): GearItem | undefined {
  return ARMORY_DATA[className].items.find((item) => item.id === itemId)
}

export function getGearSource(sourceId: string): GearSource | undefined {
  return ARMORY_SOURCES[sourceId]
}
