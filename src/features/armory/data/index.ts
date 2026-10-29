import mageData from './mage.json'
import paladinData from './paladin.json'
import rogueData from './rogue.json'
import { ARMORY_CLASSES } from './constants'
import { ARMORY_MANIFEST, ARMORY_SOURCES, getGearSource } from './meta'
import type { ArmoryClass, ArmoryClassData, GearItem } from '@/features/armory/types'

export { ARMORY_CLASSES, ARMORY_MANIFEST, ARMORY_SOURCES, getGearSource }

export const ARMORY_DATA: Record<ArmoryClass, ArmoryClassData> = {
  paladin: paladinData as ArmoryClassData,
  rogue: rogueData as ArmoryClassData,
  mage: mageData as ArmoryClassData,
}

export function getArmoryClass(className: ArmoryClass): ArmoryClassData {
  return ARMORY_DATA[className]
}

export function getGearItem(className: ArmoryClass, itemId: number): GearItem | undefined {
  return ARMORY_DATA[className].items.find((item) => item.id === itemId)
}
