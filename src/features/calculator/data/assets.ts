import navBackground from '@/assets/game/calculator/ui/bg-disciplines.webp?url&no-inline'
import navSprite from '@/assets/game/calculator/ui/discipline-select.webp?url&no-inline'
import skillSheet0 from '@/assets/game/calculator/ui/master-skills-0.webp?url&no-inline'
import skillSheet1 from '@/assets/game/calculator/ui/master-skills-1.webp?url&no-inline'
import skillSheet2 from '@/assets/game/calculator/ui/master-skills-2.webp?url&no-inline'
import skillSheet3 from '@/assets/game/calculator/ui/master-skills-3.webp?url&no-inline'
import skillSheet4 from '@/assets/game/calculator/ui/master-skills-4.webp?url&no-inline'
import skillSheet5 from '@/assets/game/calculator/ui/master-skills-5.webp?url&no-inline'
import skillSheet6 from '@/assets/game/calculator/ui/master-skills-6.webp?url&no-inline'
import skillSheet7 from '@/assets/game/calculator/ui/master-skills-7.webp?url&no-inline'
import skillSheet8 from '@/assets/game/calculator/ui/master-skills-8.webp?url&no-inline'
import closedSlot from '@/assets/game/calculator/ui/talent-slot-closed.webp?url&no-inline'
import treeArt from '@/assets/game/calculator/ui/talent-tree-v5.webp?url&no-inline'

const iconModules = import.meta.glob('@/assets/game/calculator/icons/*.webp', {
  eager: true,
  import: 'default',
  query: '?url&no-inline',
}) as Record<string, string>

function iconName(path: string): string {
  const file = path.split('/').at(-1) ?? ''
  return file.replace(/\.webp$/, '')
}

const iconUrls = Object.fromEntries(
  Object.entries(iconModules).map(([path, url]) => [iconName(path), url]),
)

export function iconUrl(name: string): string {
  return iconUrls[name] ?? ''
}

export const UI = {
  navBackground,
  navSprite,
  closedSlot,
  treeArt,
  skillSheets: [
    skillSheet0,
    skillSheet1,
    skillSheet2,
    skillSheet3,
    skillSheet4,
    skillSheet5,
    skillSheet6,
    skillSheet7,
    skillSheet8,
  ],
} as const
