import { DEFAULT_DISCIPLINE_ID, TREE } from '../data/meta'
import type {
  BuildSlot,
  DecodedBuild,
  DisciplineData,
  SocketedStone,
  StatSummary,
  Talent,
  TreeData,
} from '../data/types'

export const TREE_SIZE = 608
export const TALENT_TIER_COUNT = 14
export const TALENTS_PER_TIER = 3
export const MAX_TALENT_LEVEL = 5
export const ENCODE_ALPHABET = '123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

export type StoneMap = Record<number, SocketedStone | undefined>

export interface TalentEntry {
  id: number
  talent: Talent
  tier: number
  tierPos: number
}

export interface SkillState {
  id: number
  pointsRequired: number
  pointsRemaining: number
  connected: boolean
  unlocked: boolean
}

export function tierRequiredPoints(tier: number): number {
  return Math.max(0, (tier - 1) * 5)
}

export function isTierUnlocked(tier: number, pointsSpent: number): boolean {
  return pointsSpent >= tierRequiredPoints(tier)
}

export function talentEntries(data: DisciplineData): TalentEntry[] {
  return data.talents.map((talent, id) => ({
    id,
    talent,
    tier: talent.tier[0],
    tierPos: talent.tier[1],
  }))
}

export function talentsByTier(data: DisciplineData): TalentEntry[][] {
  const tiers: TalentEntry[][] = Array.from({ length: TALENT_TIER_COUNT }, () => [])
  for (const entry of talentEntries(data)) {
    const row = tiers[entry.tier - 1]
    if (row && entry.tierPos >= 1 && entry.tierPos <= TALENTS_PER_TIER) {
      row[entry.tierPos - 1] = entry
    }
  }
  return tiers
}

export function countPoints(stones: StoneMap): number {
  return Object.values(stones).reduce((total, stone) => {
    return total + (stone ? stone.talentLevel + 1 : 0)
  }, 0)
}

export function getSkillStates(stones: StoneMap, pointsSpent: number, tree: TreeData = TREE): SkillState[] {
  return tree.skillSlots.map((slot, id) => {
    const pointsRemaining = Math.max(0, slot.pointsRequired - pointsSpent)
    const connected = slot.connection === -1 || Boolean(stones[slot.connection])
    return {
      id,
      pointsRequired: slot.pointsRequired,
      pointsRemaining,
      connected,
      unlocked: pointsRemaining === 0 && connected,
    }
  })
}

export function getSkillSocketLock(
  stones: StoneMap,
  pointsSpent: number,
  tree: TreeData = TREE,
): number {
  for (let skillId = 1; skillId < tree.skillSlots.length; skillId += 1) {
    const state = getSkillStates(stones, pointsSpent, tree)[skillId]
    if (state && !state.unlocked) {
      return tree.skillSlots[skillId]?.connection ?? 0
    }
  }
  return 0
}

export function getUnlockedSlots(
  stones: StoneMap,
  pointsSpent: number,
  tree: TreeData = TREE,
): Set<number> {
  const unlocked = new Set<number>([0, 1])
  const barrier = getSkillSocketLock(stones, pointsSpent, tree)

  for (let slotId = 0; slotId < tree.talentSlots.length; slotId += 1) {
    const stone = stones[slotId]
    if (!stone) continue
    unlocked.add(slotId)
    for (const connection of tree.talentSlots[slotId]?.connections ?? []) {
      if (barrier === 0 || connection <= barrier) unlocked.add(connection)
    }
  }

  return unlocked
}

export function isSlotUnlocked(
  slotId: number,
  stones: StoneMap,
  pointsSpent: number,
  tree: TreeData = TREE,
): boolean {
  return getUnlockedSlots(stones, pointsSpent, tree).has(slotId)
}

export function getTier(pointsSpent: number): number {
  return Math.floor(pointsSpent / 5)
}

export function getExperiencePercent(pointsSpent: number): number {
  return Math.min(100, (pointsSpent / 70) * 100)
}

export function getPointsPercent(pointsSpent: number, tree: TreeData = TREE): number {
  return Math.min(100, (pointsSpent / tree.maxPoints) * 100)
}

export function getRequiredLevel(pointsSpent: number): number {
  return Math.max(10, Math.min(50, pointsSpent + 9))
}

export function getRequiredTotemLevel(pointsSpent: number): number {
  return Math.max(1, Math.ceil((pointsSpent - 40) / 5))
}

export function getSkillSpritePosition(
  skillId: number,
  disciplineId: number,
  unlocked: boolean,
): { x: number; y: number } {
  const classId = Math.floor(disciplineId / 3)
  const x = -65 * (skillId + 3 * (disciplineId % 3))
  const baseY = -130 * classId
  const y = unlocked ? baseY : baseY - 65
  return { x, y }
}

export function encodeBuild(
  disciplineId: number,
  stones: StoneMap,
  tree: TreeData = TREE,
): string {
  let build = `#${disciplineId}`
  for (let slotId = 0; slotId < tree.talentSlots.length; slotId += 1) {
    const stone = stones[slotId]
    if (stone) {
      build += `${stone.talentLevel + 1}${ENCODE_ALPHABET.charAt(stone.talentId)}`
    } else {
      build += '0'
    }
  }
  let end = build.length - 1
  while (end > 1 && build.charAt(end) === '0') end -= 1
  return build.slice(0, end + 1)
}

export function decodeBuild(input: string, tree: TreeData = TREE): DecodedBuild {
  const hash = input.startsWith('#') ? input.slice(1) : input
  const safe = hash.slice(0, 1 + tree.talentSlots.length * 2)
  const parsedDiscipline = Number.parseInt(safe.charAt(0), 10)
  const disciplineId = Number.isFinite(parsedDiscipline) ? parsedDiscipline : 0

  const slots: BuildSlot[] = []
  let index = 1
  let slotId = 0

  while (index < safe.length && slotId < tree.talentSlots.length) {
    const levelChar = safe.charAt(index)
    index += 1
    const level = Number.parseInt(levelChar, 10)

    if (Number.isFinite(level) && level >= 1 && level <= 9) {
      const talentChar = safe.charAt(index)
      index += 1
      const talentId = ENCODE_ALPHABET.indexOf(talentChar)
      if (talentId >= 0) {
        slots.push({ slotId, talentId, level })
      }
    }

    slotId += 1
  }

  return { disciplineId, slots }
}

export function clampDiscipline(disciplineId: number, tree: TreeData = TREE): number {
  return disciplineId >= 0 && disciplineId < tree.disciplines.length
    ? disciplineId
    : DEFAULT_DISCIPLINE_ID
}

export function applyBuild(
  decoded: DecodedBuild,
  data: DisciplineData,
  tree: TreeData = TREE,
): { disciplineId: number; stones: StoneMap } {
  const disciplineId = clampDiscipline(decoded.disciplineId, tree)

  const stones: StoneMap = {}
  const usedTalents = new Set<number>()
  let pointsSpent = 0

  for (const slot of decoded.slots) {
    if (pointsSpent >= tree.maxPoints) break
    if (slot.slotId < 0 || slot.slotId >= tree.talentSlots.length) continue
    const talent = data.talents[slot.talentId]
    const treeSlot = tree.talentSlots[slot.slotId]
    if (!talent || !treeSlot || usedTalents.has(slot.talentId)) continue

    const capacity = Math.min(treeSlot.capacity, MAX_TALENT_LEVEL)
    const level = Math.min(slot.level, capacity, tree.maxPoints - pointsSpent)
    if (level < 1) continue

    stones[slot.slotId] = {
      talentId: slot.talentId,
      talentLevel: level - 1,
      tier: talent.tier[0],
      tierPos: talent.tier[1],
    }
    usedTalents.add(slot.talentId)
    pointsSpent += level
  }

  return { disciplineId, stones }
}

export function parseBuildHash(
  hash: string,
  data: DisciplineData,
  tree: TreeData = TREE,
): { disciplineId: number; stones: StoneMap } | null {
  if (!hash || hash === '#') return null
  const decoded = decodeBuild(hash, tree)
  if (decoded.slots.length === 0) {
    return { disciplineId: clampDiscipline(decoded.disciplineId, tree), stones: {} }
  }
  return applyBuild(decoded, data, tree)
}

function parseNumericValue(value: string): number {
  const parsed = Number.parseFloat(value.replace('%', '').replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : 0
}

function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return '0'
  const fixed = value.toFixed(2)
  return fixed.replace(/\.?0+$/, '')
}

function talentValuesForParameter(talent: Talent, parameterIndex: number): string[] {
  if (Array.isArray(talent.parameter)) {
    const values = talent.values as string[][]
    return values[parameterIndex] ?? []
  }
  return talent.values as string[]
}

function statHasPercent(data: DisciplineData, statId: number): boolean {
  return data.talents.some((talent) => {
    if (talent.stat !== statId) return false
    const firstValues = Array.isArray(talent.parameter)
      ? (talent.values as string[][])[0]
      : (talent.values as string[])
    return Boolean(firstValues?.some((value) => value.includes('%')))
  })
}

export function computeStats(data: DisciplineData, stones: StoneMap): StatSummary[] {
  return data.stats.map((stat, statId) => {
    const parameters = Array.isArray(stat.parameter) ? stat.parameter : [stat.parameter]
    const percent = statHasPercent(data, statId)
    const values = parameters.map((_, parameterIndex) => {
      let total = 0
      for (const stone of Object.values(stones)) {
        if (!stone) continue
        const talent = data.talents[stone.talentId]
        if (!talent || talent.stat !== statId) continue
        const valuesForParameter = talentValuesForParameter(talent, parameterIndex)
        total += parseNumericValue(valuesForParameter[stone.talentLevel] ?? '0')
      }
      return total
    })

    const prefix = stat.no_add ? '' : '+'
    const suffix = percent ? '%' : ''
    const formatted = values.map((value) => `${prefix}${formatNumber(value)}${suffix}`).join(' / ')
    const fallbackIcon =
      stat.icon || data.talents.find((talent) => talent.stat === statId)?.icon || ''

    return {
      statId,
      name: stat.name,
      parameter: stat.parameter,
      description: stat.description,
      noAdd: stat.no_add,
      icon: fallbackIcon,
      value: formatted,
    }
  })
}

export function canSocketTalent(
  entry: TalentEntry,
  slotId: number,
  stones: StoneMap,
  pointsSpent: number,
  tree: TreeData = TREE,
): boolean {
  if (!isTierUnlocked(entry.tier, pointsSpent)) return false
  if (stones[slotId]) return false
  if (!isSlotUnlocked(slotId, stones, pointsSpent, tree)) return false
  return !Object.values(stones).some((stone) => stone?.talentId === entry.id)
}

export function addPointToSlot(
  slotId: number,
  stones: StoneMap,
  pointsSpent: number,
  tree: TreeData = TREE,
): StoneMap {
  const stone = stones[slotId]
  if (!stone) return stones
  const capacity = Math.min(tree.talentSlots[slotId]?.capacity ?? MAX_TALENT_LEVEL, MAX_TALENT_LEVEL)
  if (stone.talentLevel + 1 >= capacity) return stones
  if (pointsSpent >= tree.maxPoints) return stones
  return {
    ...stones,
    [slotId]: { ...stone, talentLevel: stone.talentLevel + 1 },
  }
}

export function undoLastPoint(
  history: number[],
  stones: StoneMap,
): { stones: StoneMap; history: number[] } {
  const nextHistory = [...history]
  const slotId = nextHistory.pop()
  if (slotId === undefined) return { stones, history }

  const stone = stones[slotId]
  if (!stone) return { stones, history: nextHistory }

  const nextStones = { ...stones }
  if (stone.talentLevel > 0) {
    nextStones[slotId] = { ...stone, talentLevel: stone.talentLevel - 1 }
  } else {
    delete nextStones[slotId]
  }
  return { stones: nextStones, history: nextHistory }
}

export function socketTalent(
  entry: TalentEntry,
  slotId: number,
  stones: StoneMap,
  history: number[],
  pointsSpent: number,
  tree: TreeData = TREE,
): { stones: StoneMap; history: number[] } | null {
  if (!canSocketTalent(entry, slotId, stones, pointsSpent, tree)) return null
  return {
    stones: {
      ...stones,
      [slotId]: {
        talentId: entry.id,
        talentLevel: 0,
        tier: entry.tier,
        tierPos: entry.tierPos,
      },
    },
    history: [...history, slotId],
  }
}
