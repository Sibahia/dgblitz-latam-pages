import navBackground from '../../../assets/game/calculator/ui/bg-disciplines.png'
import panelFrame from '../../../assets/game/calculator/ui/bg-panel.png'
import pointsFrame from '../../../assets/game/calculator/ui/bg-talent-points.png'
import navSprite from '../../../assets/game/calculator/ui/discipline-select.png'
import expSprite from '../../../assets/game/calculator/ui/talent-exp.png'
import pointSprite from '../../../assets/game/calculator/ui/talent-point.png'
import skillLock from '../../../assets/game/calculator/ui/skill-lock.png'
import skillSprite from '../../../assets/game/calculator/ui/master-skills.png'
import selectFrame from '../../../assets/game/calculator/ui/selects-v2.png'
import selectFrameSelected from '../../../assets/game/calculator/ui/selects.png'
import selectTreeFrame from '../../../assets/game/calculator/ui/selects-tree-v2.png'
import closedSlot from '../../../assets/game/calculator/ui/talent-slot-closed.png'
import slotFrame from '../../../assets/game/calculator/ui/slot.png'
import talentTip from '../../../assets/game/calculator/ui/talent-tip.png'
import treeArt from '../../../assets/game/calculator/ui/talent-tree-v5.png'

const iconModules = import.meta.glob('../../../assets/game/calculator/icons/*.png', {
  eager: true,
  import: 'default',
}) as Record<string, string>

export function iconUrl(name: string): string {
  return iconModules[`../../../assets/game/calculator/icons/${name}.png`] ?? ''
}

export const UI = {
  navBackground,
  panelFrame,
  pointsFrame,
  navSprite,
  expSprite,
  pointSprite,
  skillLock,
  skillSprite,
  selectFrame,
  selectFrameSelected,
  selectTreeFrame,
  closedSlot,
  slotFrame,
  talentTip,
  treeArt,
} as const
