export interface Talent {
  name: string
  tier: [number, number]
  description: string
  parameter: string | string[]
  values: string[] | string[][]
  stat: number
  icon: string
  no_add: boolean
}

export interface Skill {
  name: string
  description: string
}

export interface Stat {
  icon: string
  parameter: string | string[]
  description: string
  name: string
  no_add: boolean
}

export interface DisciplineData {
  talents: Talent[]
  skills: Skill[]
  stats: Stat[]
}

export interface TalentSlot {
  id: number
  pos: [number, number]
  capacity: number
  connections: number[]
}

export interface SkillSlot {
  pos: [number, number]
  pointsRequired: number
  connection: number
}

export interface TreeData {
  classes: string[]
  disciplines: string[]
  maxPoints: number
  talentSlots: TalentSlot[]
  skillSlots: SkillSlot[]
}

export interface SocketedStone {
  talentId: number
  talentLevel: number
  tier: number
  tierPos: number
}

export interface BuildSlot {
  slotId: number
  talentId: number
  level: number
}

export interface DecodedBuild {
  disciplineId: number
  slots: BuildSlot[]
}

export interface StatSummary {
  statId: number
  name: string
  parameter: string | string[]
  description: string
  noAdd: boolean
  icon: string
  value: string
}
