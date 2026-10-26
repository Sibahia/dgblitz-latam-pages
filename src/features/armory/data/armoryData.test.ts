import { describe, expect, it } from 'vitest'
import {
  ARMORY_CLASSES,
  ARMORY_DATA,
  ARMORY_MANIFEST,
  ARMORY_SOURCES,
  getGearItem,
} from './index'
import type { BossGearSource, GearSource, RealmGearSource } from '../types'

const allItems = ARMORY_CLASSES.flatMap((className) => ARMORY_DATA[className].items)
const allVariants = allItems.flatMap((item) => item.variants)

function isDungeonSource(source: GearSource): source is BossGearSource | RealmGearSource {
  return source.kind === 'boss' || source.kind === 'realm'
}

describe('armory dataset', () => {
  it('ships the expected manifest counts', () => {
    expect(ARMORY_MANIFEST.counts).toMatchObject({
      bases: 1182,
      variants: 3546,
      bossBases: 573,
      bossVariants: 1719,
      realmBases: 579,
      realmVariants: 1749,
      starterBases: 6,
      starterVariants: 6,
      specialBases: 24,
      specialVariants: 72,
      globalBases: 30,
      globalVariants: 78,
      sources: 147,
      bossSources: 64,
      realmSources: 53,
      starterSources: 6,
      globalSources: 24,
      dungeons: 65,
      missions: 293,
      missionsWithDungeon: 168,
      missionsInGearDungeons: 130,
      missionNames: 67,
    })
  })

  it('has 394 bases and 1182 variants per class', () => {
    for (const className of ARMORY_CLASSES) {
      const data = ARMORY_DATA[className]
      expect(data.class).toBe(className)
      expect(data.items).toHaveLength(394)
      expect(data.items.flatMap((item) => item.variants)).toHaveLength(1182)
      expect(ARMORY_MANIFEST.classes[className]).toMatchObject({
        bases: 394,
        variants: 1182,
      })
    }
  })

  it('keeps every item sorted with one M, R and L variant', () => {
    for (const className of ARMORY_CLASSES) {
      const items = ARMORY_DATA[className].items
      expect(items.map((item) => item.id)).toEqual([...items.map((item) => item.id)].sort((a, b) => a - b))
      for (const item of items) {
        expect(item.name.length).toBeGreaterThan(0)
        expect(item.variants.map((variant) => variant.rarity)).toEqual(['M', 'R', 'L'])
        expect(item.variants.every((variant) => variant.name.length > 0)).toBe(true)
        expect(item.variants.every((variant) => variant.artKey.length > 0)).toBe(true)
        expect(item.variants.every((variant) => variant.iconKey.length > 0)).toBe(true)
      }
    }
  })

  it('resolves every variant to a known source and uses every source', () => {
    const usedSourceIds = new Set(allVariants.map((variant) => variant.sourceId))
    expect(usedSourceIds.size).toBe(ARMORY_MANIFEST.counts.sources)
    for (const sourceId of usedSourceIds) {
      expect(ARMORY_SOURCES[sourceId]).toBeDefined()
    }
    expect(Object.keys(ARMORY_SOURCES)).toHaveLength(147)
  })

  it('models starter and special gear with their intended semantics', () => {
    const farmerAxe = getGearItem('paladin', 1)
    expect(farmerAxe).toBeDefined()
    expect(farmerAxe?.variants.map((variant) => variant.level)).toEqual([1, 5, 5])
    expect(farmerAxe?.variants.map((variant) => variant.sourceId)).toEqual([
      'starter:1',
      'realm:Ghost:5',
      'realm:Ghost:5',
    ])

    const abyssal = getGearItem('paladin', 1182)
    expect(abyssal).toBeDefined()
    expect(abyssal?.variants.map((variant) => variant.level)).toEqual([null, null, null])
    expect(abyssal?.variants.map((variant) => variant.sourceId)).toEqual([
      'global:1182',
      'global:1182',
      'global:1182',
    ])
  })

  it('has boss and realm sources with a dungeon and mission names', () => {
    const grayGhostLord = ARMORY_SOURCES['boss:GrayGhostLord']
    expect(grayGhostLord).toMatchObject({
      kind: 'boss',
      boss: 'GrayGhostLord',
      dungeon: {
        key: 'ghostbossdungeon',
        levelName: 'GhostBossDungeon',
        name: "Nephit's Quest",
      },
    })
    if (!grayGhostLord || !isDungeonSource(grayGhostLord)) {
      throw new Error('expected GrayGhostLord to be a dungeon source')
    }
    expect(grayGhostLord.missions.length).toBeGreaterThan(0)

    const starterRealm = ARMORY_SOURCES['realm:Ghost:5']
    expect(starterRealm).toMatchObject({
      kind: 'realm',
      realm: 'Ghost',
      level: 5,
      dungeon: {
        key: 'dreamdragondungeon',
        levelName: 'DreamDragonDungeon',
        name: "The Dragon's Dream",
      },
    })

    for (const source of Object.values(ARMORY_SOURCES)) {
      if (isDungeonSource(source)) {
        expect(source.dungeon.key.length).toBeGreaterThan(0)
        expect(source.dungeon.name.length).toBeGreaterThan(0)
        expect(source.missions.length).toBeGreaterThan(0)
      }
    }
  })

  it('aggregates 65 dungeons and 67 unique mission names', () => {
    const dungeonKeys = new Set(
      Object.values(ARMORY_SOURCES)
        .filter(isDungeonSource)
        .map((source) => source.dungeon.key),
    )
    const missionNames = new Set(
      Object.values(ARMORY_SOURCES)
        .filter(isDungeonSource)
        .flatMap((source) => source.missions),
    )
    expect(dungeonKeys.size).toBe(65)
    expect(missionNames.size).toBe(67)
  })

  it('keeps the art-key invariants from the export', () => {
    expect(new Set(allVariants.map((variant) => variant.artKey)).size).toBe(1183)
    expect(new Set(allVariants.map((variant) => variant.iconKey)).size).toBe(3466)
    expect(allVariants.filter((variant) => variant.artKey.startsWith('|'))).toHaveLength(54)
    expect(allVariants.filter((variant) => variant.artKey === '||')).toHaveLength(0)
  })

  it('keeps global levels empty except for the six starter base variants', () => {
    for (const variant of allVariants) {
      if (variant.sourceId.startsWith('global:')) {
        expect(variant.level).toBeNull()
      }
      if (variant.sourceId.startsWith('starter:')) {
        expect(variant.level).toBe(1)
      }
    }
  })
})
