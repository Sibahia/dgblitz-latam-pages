import {
  DEFAULT_DISCIPLINE_ID,
  DISCIPLINE_SUMMARIES,
  type DisciplineSlug,
  type DisciplineSummary,
} from './disciplines'
import executionerData from './executioner.json'
import flameseerData from './flameseer.json'
import frostwardenData from './frostwarden.json'
import justicarData from './justicar.json'
import necromancerData from './necromancer.json'
import sentinelData from './sentinel.json'
import shadowwalkerData from './shadowwalker.json'
import soulthiefData from './soulthief.json'
import templarData from './templar.json'
import treeData from './tree.json'
import type { DisciplineData, TreeData } from './types'

export { CLASSES, DEFAULT_DISCIPLINE_ID } from './disciplines'
export { iconUrl, UI } from './assets'

export type { DisciplineSummary } from './disciplines'

export const TREE = treeData as TreeData

export interface DisciplineMeta extends DisciplineSummary {
  data: DisciplineData
}

const DISCIPLINE_DATA: Record<DisciplineSlug, DisciplineData> = {
  frostwarden: frostwardenData as DisciplineData,
  flameseer: flameseerData as DisciplineData,
  necromancer: necromancerData as DisciplineData,
  executioner: executionerData as DisciplineData,
  shadowwalker: shadowwalkerData as DisciplineData,
  soulthief: soulthiefData as DisciplineData,
  sentinel: sentinelData as DisciplineData,
  justicar: justicarData as DisciplineData,
  templar: templarData as DisciplineData,
}

export const DISCIPLINES: DisciplineMeta[] = DISCIPLINE_SUMMARIES.map((summary) => ({
  ...summary,
  data: DISCIPLINE_DATA[summary.slug],
}))

export const DISCIPLINE_BY_ID = new Map(DISCIPLINES.map((discipline) => [discipline.id, discipline]))

export function getDiscipline(id: number): DisciplineMeta {
  return DISCIPLINE_BY_ID.get(id) ?? DISCIPLINE_BY_ID.get(DEFAULT_DISCIPLINE_ID) ?? DISCIPLINES[0]
}

export function getDisciplineBySlug(slug: string): DisciplineMeta | undefined {
  return DISCIPLINES.find((discipline) => discipline.slug === slug)
}
