import type { ArmoryClass, ArmoryClassData } from '@/features/armory/types'

export async function loadArmoryClass(className: ArmoryClass): Promise<ArmoryClassData> {
  switch (className) {
    case 'paladin':
      return (await import('./paladin.json')).default as ArmoryClassData
    case 'rogue':
      return (await import('./rogue.json')).default as ArmoryClassData
    case 'mage':
      return (await import('./mage.json')).default as ArmoryClassData
  }
}
