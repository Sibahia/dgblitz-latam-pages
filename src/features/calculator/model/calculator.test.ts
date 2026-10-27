import { describe, expect, it } from 'vitest'
import { DEFAULT_DISCIPLINE_ID, getDiscipline, TREE } from '@/features/calculator/data/meta'
import {
  addPointToSlot,
  canSocketTalent,
  computeStats,
  countPoints,
  decodeBuild,
  encodeBuild,
  getSkillSpritePosition,
  getSkillStates,
  getUnlockedSlots,
  isSlotUnlocked,
  isTierUnlocked,
  parseBuildHash,
  socketTalent,
  talentEntries,
  tierRequiredPoints,
  undoLastPoint,
  type StoneMap,
} from './calculator'

const flameseer = getDiscipline(1)
const entries = talentEntries(flameseer.data)
const firstTalent = entries[0]

function socketFirst(slotId: number, stones: StoneMap = {}) {
  const result = socketTalent(firstTalent, slotId, stones, [], countPoints(stones), TREE)
  if (!result) throw new Error('expected the talent to be socketable')
  return result
}

describe('tier requirements', () => {
  it('opens tier 1 without points and gates later tiers by 5 each', () => {
    expect(tierRequiredPoints(1)).toBe(0)
    expect(tierRequiredPoints(3)).toBe(10)
    expect(isTierUnlocked(1, 0)).toBe(true)
    expect(isTierUnlocked(3, 9)).toBe(false)
    expect(isTierUnlocked(3, 10)).toBe(true)
  })
})

describe('build encoding', () => {
  it('encodes an empty build as the discipline marker only', () => {
    expect(encodeBuild(1, {}, TREE)).toBe('#1')
  })

  it('round-trips a socketed build', () => {
    const { stones } = socketFirst(0)
    const hash = encodeBuild(1, stones, TREE)
    const decoded = decodeBuild(hash, TREE)
    expect(decoded.disciplineId).toBe(1)
    expect(decoded.slots).toEqual([{ slotId: 0, talentId: firstTalent.id, level: 1 }])
  })

  it('loads legacy hashes and clamps invalid values', () => {
    const parsed = parseBuildHash('#1' + '9z'.repeat(40), flameseer.data, TREE)
    expect(parsed).not.toBeNull()
    const points = countPoints(parsed?.stones ?? {})
    expect(points).toBeLessThanOrEqual(TREE.maxPoints)
  })

  it('falls back to the default discipline for unknown ids', () => {
    const parsed = parseBuildHash('#9', flameseer.data, TREE)
    expect(parsed?.disciplineId).toBe(DEFAULT_DISCIPLINE_ID)
  })
})

describe('socketing rules', () => {
  it('keeps the two starting slots open', () => {
    expect(isSlotUnlocked(0, {}, 0, TREE)).toBe(true)
    expect(isSlotUnlocked(1, {}, 0, TREE)).toBe(true)
    expect(getUnlockedSlots({}, 0, TREE).size).toBe(2)
  })

  it('opens connected slots after socketing a stone', () => {
    const { stones } = socketFirst(0)
    expect(isSlotUnlocked(2, stones, 1, TREE)).toBe(true)
  })

  it('never places the same talent twice', () => {
    const { stones } = socketFirst(0)
    expect(canSocketTalent(firstTalent, 1, stones, 1, TREE)).toBe(false)
  })

  it('rejects talents from a tier that is still locked', () => {
    const lockedTalent = entries.find((entry) => entry.tier === 2)
    if (!lockedTalent) throw new Error('expected a tier 2 talent')
    expect(canSocketTalent(lockedTalent, 0, {}, 0, TREE)).toBe(false)
  })

  it('raises a socketed stone up to its capacity', () => {
    let stones = socketFirst(0).stones
    for (let index = 0; index < 10; index += 1) {
      stones = addPointToSlot(0, stones, countPoints(stones), TREE)
    }
    expect(stones[0]?.talentLevel).toBe(1)
    expect(countPoints(stones)).toBe(2)
  })

  it('undoes the last invested point', () => {
    const socketed = socketFirst(0)
    const next = undoLastPoint(socketed.history, socketed.stones)
    expect(next.stones[0]).toBeUndefined()
    expect(next.history).toEqual([])
  })
})

describe('skill sprite positions', () => {
  it('uses local coordinates inside a single discipline sheet', () => {
    expect(getSkillSpritePosition(0, true)).toEqual({ x: 0, y: 0 })
    expect(getSkillSpritePosition(1, true)).toEqual({ x: -65, y: 0 })
    expect(getSkillSpritePosition(2, false)).toEqual({ x: -130, y: -65 })
  })

  it('keeps every skill frame inside the 195x130 sheet', () => {
    for (let skillId = 0; skillId < 3; skillId += 1) {
      for (const unlocked of [true, false]) {
        const { x, y } = getSkillSpritePosition(skillId, unlocked)
        expect(x).toBeLessThanOrEqual(0)
        expect(x).toBeGreaterThanOrEqual(-130)
        expect(y).toBeGreaterThanOrEqual(-65)
        expect(y).toBeLessThanOrEqual(0)
      }
    }
  })
})

describe('skill slots', () => {
  it('unlocks the first skill for free and gates the rest by points and connection', () => {
    const initial = getSkillStates({}, 0, TREE)
    expect(initial[0]?.unlocked).toBe(true)
    expect(initial[1]?.unlocked).toBe(false)
    expect(initial[2]?.unlocked).toBe(false)
  })

  it('unlocks the second skill with 20 points and a filled connection', () => {
    const stones: StoneMap = {
      8: { talentId: 2, talentLevel: 0, tier: 1, tierPos: 3 },
    }
    const states = getSkillStates(stones, 20, TREE)
    expect(states[1]?.unlocked).toBe(true)
    expect(states[2]?.unlocked).toBe(false)
  })
})

describe('stat computation', () => {
  it('returns one summary per discipline stat', () => {
    expect(computeStats(flameseer.data, {})).toHaveLength(flameseer.data.stats.length)
  })

  it('adds the talent value of the socketed stone', () => {
    const { stones } = socketFirst(0)
    const stats = computeStats(flameseer.data, stones)
    expect(stats.some((stat) => !/^\+?0%?$/.test(stat.value))).toBe(true)
  })
})
