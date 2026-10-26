export type ArmoryClass = 'paladin' | 'rogue' | 'mage'

export type GearRarity = 'M' | 'R' | 'L'

export type GearSlot = 'weapon' | 'offhand' | 'head' | 'armor' | 'gloves' | 'boots'

export type GearSubtype = 'axe' | 'mace' | 'sword' | 'saber' | 'scepter' | 'rapier' | 'staff'

export interface DungeonRef {
  key: string
  levelName: string
  name: string
}

export interface BossGearSource {
  kind: 'boss'
  boss: string
  dungeon: DungeonRef
  missions: string[]
}

export interface RealmGearSource {
  kind: 'realm'
  realm: string
  level: number
  dungeon: DungeonRef
  missions: string[]
}

export interface StarterGearSource {
  kind: 'starter'
  label: 'Starter'
}

export interface GlobalGearSource {
  kind: 'global'
  label: 'Special'
}

export type GearSource = BossGearSource | RealmGearSource | StarterGearSource | GlobalGearSource

export interface GearVariant {
  name: string
  rarity: GearRarity
  level: number | null
  artKey: string
  iconKey: string
  sourceId: string
}

export interface GearItem {
  id: number
  name: string
  slot: GearSlot
  subtype: GearSubtype | null
  variants: GearVariant[]
}

export interface ArmoryClassData {
  schemaVersion: 1
  class: ArmoryClass
  items: GearItem[]
}

export interface ArmorySourcesData {
  schemaVersion: 1
  sources: Record<string, GearSource>
}

export interface ArmoryClassStats {
  bases: number
  variants: number
  slots: Record<GearSlot, number>
  subtypes: Partial<Record<GearSubtype, number>>
}

export interface ArmoryManifest {
  schemaVersion: 1
  sourceFiles: {
    loginSwz: string
    gameEnSwz: string
    dungeonBlitzSwf: string
  }
  sourceHashes: {
    loginSwz: string
    gameEnSwz: string
    dungeonBlitzSwf: string
  }
  counts: {
    bases: number
    variants: number
    bossBases: number
    bossVariants: number
    realmBases: number
    realmVariants: number
    starterBases: number
    starterVariants: number
    specialBases: number
    specialVariants: number
    globalBases: number
    globalVariants: number
    sources: number
    bossSources: number
    realmSources: number
    starterSources: number
    globalSources: number
    dungeons: number
    missions: number
    missionsWithDungeon: number
    missionsInGearDungeons: number
    missionNames: number
  }
  classes: Record<ArmoryClass, ArmoryClassStats>
  art: {
    uniqueCustomArt: number
    artKeys: number
    iconKeys: number
    variantsWithoutPrimaryArt: number
    variantsWithoutAnyArt: number
  }
}
