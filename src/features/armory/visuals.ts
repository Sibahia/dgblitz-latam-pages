import axeStarter from '@/assets/game/armory/icons/AxeStarter1-56.webp?url&no-inline'
import goblinChopper from '@/assets/game/armory/icons/GoblinChopperM-56.webp?url&no-inline'
import illyricAxe from '@/assets/game/armory/icons/IllyricAxeM-56.webp?url&no-inline'
import bronzePlate from '@/assets/game/armory/ui/_DoodadItemPlateBronze01.webp?url&no-inline'
import goldPlate from '@/assets/game/armory/ui/_DoodadItemPlateGold01.webp?url&no-inline'
import silverPlate from '@/assets/game/armory/ui/_DoodadItemPlateSilver01.webp?url&no-inline'
import emptySlot from '@/assets/game/armory/ui/a_EmptyGearSlotMoveable.webp?url&no-inline'
import type { GearRarity } from '@/features/armory/types'

export const RARITY_PLATES: Record<GearRarity, string> = {
  M: bronzePlate,
  R: silverPlate,
  L: goldPlate,
}

export const SLICE_ICONS: Record<number, string> = {
  1: axeStarter,
  2: goblinChopper,
  3: illyricAxe,
}

export const FALLBACK_ITEM_ICON = emptySlot

export function getItemIcon(itemId: number): string {
  return SLICE_ICONS[itemId] ?? FALLBACK_ITEM_ICON
}
