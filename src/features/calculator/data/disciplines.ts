import flameseerMedium from '@/assets/game/disciplines/flameseer-256.webp?url&no-inline'
import flameseerSmall from '@/assets/game/disciplines/flameseer-96.webp?url&no-inline'
import flameseerPortrait from '@/assets/game/disciplines/flameseer.webp?url&no-inline'
import frostbringerMedium from '@/assets/game/disciplines/frostbringer-256.webp?url&no-inline'
import frostbringerSmall from '@/assets/game/disciplines/frostbringer-96.webp?url&no-inline'
import frostbringerPortrait from '@/assets/game/disciplines/frostbringer.webp?url&no-inline'
import justicarMedium from '@/assets/game/disciplines/justicar-256.webp?url&no-inline'
import justicarSmall from '@/assets/game/disciplines/justicar-96.webp?url&no-inline'
import justicarPortrait from '@/assets/game/disciplines/justicar.webp?url&no-inline'
import necromancerMedium from '@/assets/game/disciplines/necromancer-256.webp?url&no-inline'
import necromancerSmall from '@/assets/game/disciplines/necromancer-96.webp?url&no-inline'
import necromancerPortrait from '@/assets/game/disciplines/necromancer.webp?url&no-inline'
import sentinelMedium from '@/assets/game/disciplines/sentinel-256.webp?url&no-inline'
import sentinelSmall from '@/assets/game/disciplines/sentinel-96.webp?url&no-inline'
import sentinelPortrait from '@/assets/game/disciplines/sentinel.webp?url&no-inline'
import shadowstalkerMedium from '@/assets/game/disciplines/shadowstalker-256.webp?url&no-inline'
import shadowstalkerSmall from '@/assets/game/disciplines/shadowstalker-96.webp?url&no-inline'
import shadowstalkerPortrait from '@/assets/game/disciplines/shadowstalker.webp?url&no-inline'
import soulthiefMedium from '@/assets/game/disciplines/soulthief-256.webp?url&no-inline'
import soulthiefSmall from '@/assets/game/disciplines/soulthief-96.webp?url&no-inline'
import soulthiefPortrait from '@/assets/game/disciplines/soulthief.webp?url&no-inline'
import templarMedium from '@/assets/game/disciplines/templar-256.webp?url&no-inline'
import templarSmall from '@/assets/game/disciplines/templar-96.webp?url&no-inline'
import templarPortrait from '@/assets/game/disciplines/templar.webp?url&no-inline'
import viperbladeMedium from '@/assets/game/disciplines/viperblade-256.webp?url&no-inline'
import viperbladeSmall from '@/assets/game/disciplines/viperblade-96.webp?url&no-inline'
import viperbladePortrait from '@/assets/game/disciplines/viperblade.webp?url&no-inline'

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
  portraitMedium: string
  portraitSmall: string
  accent: string
  focus: string[]
}

export const DISCIPLINE_SUMMARIES: DisciplineSummary[] = [
  {
    id: 0,
    name: 'FrostWarden',
    slug: 'frostwarden',
    className: 'Mage',
    portrait: frostbringerPortrait,
    portraitMedium: frostbringerMedium,
    portraitSmall: frostbringerSmall,
    accent: '#54c7e8',
    focus: ['Bone Chill', 'Piercing Cold', 'Ice Casket'],
  },
  {
    id: 1,
    name: 'Flameseer',
    slug: 'flameseer',
    className: 'Mage',
    portrait: flameseerPortrait,
    portraitMedium: flameseerMedium,
    portraitSmall: flameseerSmall,
    accent: '#f08a3c',
    focus: ['Burn Damage', 'Scorch Stacks', 'Blaze'],
  },
  {
    id: 2,
    name: 'Necromancer',
    slug: 'necromancer',
    className: 'Mage',
    portrait: necromancerPortrait,
    portraitMedium: necromancerMedium,
    portraitSmall: necromancerSmall,
    accent: '#a77bea',
    focus: ['Lingering Curse', 'Minion Master', 'Blood Bond'],
  },
  {
    id: 3,
    name: 'Executioner',
    slug: 'executioner',
    className: 'Rogue',
    portrait: viperbladePortrait,
    portraitMedium: viperbladeMedium,
    portraitSmall: viperbladeSmall,
    accent: '#9ac45a',
    focus: ['Concentrated Venom', 'Hemorrhage', 'Acid Edge'],
  },
  {
    id: 4,
    name: 'ShadowWalker',
    slug: 'shadowwalker',
    className: 'Rogue',
    portrait: shadowstalkerPortrait,
    portraitMedium: shadowstalkerMedium,
    portraitSmall: shadowstalkerSmall,
    accent: '#7d8cf0',
    focus: ['Shadow Refuge', 'Pounce', 'Opportunist'],
  },
  {
    id: 5,
    name: 'Soulthief',
    slug: 'soulthief',
    className: 'Rogue',
    portrait: soulthiefPortrait,
    portraitMedium: soulthiefMedium,
    portraitSmall: soulthiefSmall,
    accent: '#c06bdf',
    focus: ['Twisted Hex', 'Insidious Poison', 'Doom'],
  },
  {
    id: 6,
    name: 'Sentinel',
    slug: 'sentinel',
    className: 'Paladin',
    portrait: sentinelPortrait,
    portraitMedium: sentinelMedium,
    portraitSmall: sentinelSmall,
    accent: '#d4af37',
    focus: ['Taunt', 'Resilience', 'Vigor'],
  },
  {
    id: 7,
    name: 'Justicar',
    slug: 'justicar',
    className: 'Paladin',
    portrait: justicarPortrait,
    portraitMedium: justicarMedium,
    portraitSmall: justicarSmall,
    accent: '#f0cf6a',
    focus: ['Fury', 'Fire Shield', 'Zeal'],
  },
  {
    id: 8,
    name: 'Templar',
    slug: 'templar',
    className: 'Paladin',
    portrait: templarPortrait,
    portraitMedium: templarMedium,
    portraitSmall: templarSmall,
    accent: '#f1e4b0',
    focus: ['Daybreak', 'Clutch Heal', 'Fortify'],
  },
]

export const CLASSES = ['Mage', 'Rogue', 'Paladin'] as const

export const DEFAULT_DISCIPLINE_ID = 4

export function getDisciplineSummary(id: number): DisciplineSummary {
  return DISCIPLINE_SUMMARIES.find((discipline) => discipline.id === id) ?? DISCIPLINE_SUMMARIES[0]
}
