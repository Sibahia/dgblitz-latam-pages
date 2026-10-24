import frostbringer from '../../../assets/game/disciplines/frostbringer.jpg'
import flameseerArt from '../../../assets/game/disciplines/flameseer.jpg'
import necromancerArt from '../../../assets/game/disciplines/necromancer.jpg'
import viperblade from '../../../assets/game/disciplines/viperblade.jpg'
import shadowstalker from '../../../assets/game/disciplines/shadowstalker.jpg'
import soulthiefArt from '../../../assets/game/disciplines/soulthief.jpg'
import sentinelArt from '../../../assets/game/disciplines/sentinel.jpg'
import justicarArt from '../../../assets/game/disciplines/justicar.jpg'
import templarArt from '../../../assets/game/disciplines/templar.jpg'

export type DisciplineSlug =
  | 'frostwarden'
  | 'flameseer'
  | 'necromancer'
  | 'executioner'
  | 'shadowwalker'
  | 'soulthief'
  | 'sentinel'
  | 'justicar'
  | 'templar'

export interface DisciplineSummary {
  id: number
  name: string
  slug: DisciplineSlug
  className: string
  portrait: string
  accent: string
  focus: string[]
}

export const DISCIPLINE_SUMMARIES: DisciplineSummary[] = [
  {
    id: 0,
    name: 'FrostWarden',
    slug: 'frostwarden',
    className: 'Mage',
    portrait: frostbringer,
    accent: '#54c7e8',
    focus: ['Bone Chill', 'Piercing Cold', 'Ice Casket'],
  },
  {
    id: 1,
    name: 'Flameseer',
    slug: 'flameseer',
    className: 'Mage',
    portrait: flameseerArt,
    accent: '#f08a3c',
    focus: ['Burn Damage', 'Scorch Stacks', 'Blaze'],
  },
  {
    id: 2,
    name: 'Necromancer',
    slug: 'necromancer',
    className: 'Mage',
    portrait: necromancerArt,
    accent: '#a77bea',
    focus: ['Lingering Curse', 'Minion Master', 'Blood Bond'],
  },
  {
    id: 3,
    name: 'Executioner',
    slug: 'executioner',
    className: 'Rogue',
    portrait: viperblade,
    accent: '#9ac45a',
    focus: ['Concentrated Venom', 'Hemorrhage', 'Acid Edge'],
  },
  {
    id: 4,
    name: 'ShadowWalker',
    slug: 'shadowwalker',
    className: 'Rogue',
    portrait: shadowstalker,
    accent: '#7d8cf0',
    focus: ['Shadow Refuge', 'Pounce', 'Opportunist'],
  },
  {
    id: 5,
    name: 'Soulthief',
    slug: 'soulthief',
    className: 'Rogue',
    portrait: soulthiefArt,
    accent: '#c06bdf',
    focus: ['Twisted Hex', 'Insidious Poison', 'Doom'],
  },
  {
    id: 6,
    name: 'Sentinel',
    slug: 'sentinel',
    className: 'Paladin',
    portrait: sentinelArt,
    accent: '#d4af37',
    focus: ['Taunt', 'Resilience', 'Vigor'],
  },
  {
    id: 7,
    name: 'Justicar',
    slug: 'justicar',
    className: 'Paladin',
    portrait: justicarArt,
    accent: '#f0cf6a',
    focus: ['Fury', 'Fire Shield', 'Zeal'],
  },
  {
    id: 8,
    name: 'Templar',
    slug: 'templar',
    className: 'Paladin',
    portrait: templarArt,
    accent: '#f1e4b0',
    focus: ['Daybreak', 'Clutch Heal', 'Fortify'],
  },
]

export const CLASSES = ['Mage', 'Rogue', 'Paladin'] as const

export const DEFAULT_DISCIPLINE_ID = 4

export function getDisciplineSummary(id: number): DisciplineSummary {
  return DISCIPLINE_SUMMARIES.find((discipline) => discipline.id === id) ?? DISCIPLINE_SUMMARIES[0]
}
