import { existsSync } from 'node:fs'
import { mkdir, readdir, stat } from 'node:fs/promises'
import { basename, dirname, extname, relative, resolve } from 'node:path'
import sharp from 'sharp'

const root = process.cwd()
const args = new Set(process.argv.slice(2))
const checkOnly = args.has('--check')
const verify = args.has('--verify')

const UI_DIR = 'src/assets/game/calculator/ui'
const ICON_DIR = 'src/assets/game/calculator/icons'
const DISCIPLINE_DIR = 'src/assets/game/disciplines'
const BACKGROUND_SOURCE = 'src/assets/game/background.webp'

const LOSSLESS = { lossless: true, effort: 6 }
const PORTRAIT_FULL = { quality: 85, alphaQuality: 100, effort: 6, smartSubsample: true }
const PORTRAIT_SMALL = { quality: 82, alphaQuality: 100, effort: 6, smartSubsample: true }
const BACKGROUND = { quality: 85, effort: 6, smartSubsample: true }

function asset(input, output, options = {}) {
  return {
    input: resolve(root, input),
    output: resolve(root, output),
    ...options,
  }
}

function splitSkills(input) {
  const jobs = []
  for (let disciplineId = 0; disciplineId < 9; disciplineId += 1) {
    const left = 195 * (disciplineId % 3)
    const top = 130 * Math.floor(disciplineId / 3)
    jobs.push(
      asset(input, `${UI_DIR}/master-skills-${disciplineId}.webp`, {
        lossless: true,
        extract: { left, top, width: 195, height: 130 },
      }),
    )
  }
  return jobs
}

async function iconJobs() {
  const entries = await readdir(resolve(root, ICON_DIR))
  return entries
    .filter((entry) => entry.endsWith('.png'))
    .sort()
    .map((entry) =>
      asset(`${ICON_DIR}/${entry}`, `${ICON_DIR}/${basename(entry, '.png')}.webp`, {
        lossless: true,
      }),
    )
}

async function portraitJobs() {
  const entries = await readdir(resolve(root, DISCIPLINE_DIR))
  const jobs = []
  for (const entry of entries.sort()) {
    if (!/\.(jpe?g|png)$/i.test(entry)) continue
    const name = basename(entry, extname(entry))
    const input = `${DISCIPLINE_DIR}/${entry}`
    jobs.push(
      asset(input, `${DISCIPLINE_DIR}/${name}.webp`, { lossyOptions: PORTRAIT_FULL }),
      asset(input, `${DISCIPLINE_DIR}/${name}-256.webp`, {
        lossyOptions: PORTRAIT_SMALL,
        resize: { width: 256, height: 256, fit: 'cover' },
      }),
      asset(input, `${DISCIPLINE_DIR}/${name}-96.webp`, {
        lossyOptions: PORTRAIT_SMALL,
        resize: { width: 96, height: 96, fit: 'cover' },
      }),
    )
  }
  return jobs
}

const uiJobs = [
  asset(`${UI_DIR}/bg-disciplines.png`, `${UI_DIR}/bg-disciplines.webp`, { lossless: true }),
  asset(`${UI_DIR}/discipline-select.png`, `${UI_DIR}/discipline-select.webp`, { lossless: true }),
  asset(`${UI_DIR}/talent-slot-closed.png`, `${UI_DIR}/talent-slot-closed.webp`, {
    lossless: true,
  }),
  asset(`${UI_DIR}/talent-tree-v5.png`, `${UI_DIR}/talent-tree-v5.webp`, { lossless: true }),
  ...splitSkills(`${UI_DIR}/master-skills.png`),
]

const backgroundJobs = [
  asset(BACKGROUND_SOURCE, 'src/assets/game/background-960.webp', {
    lossyOptions: BACKGROUND,
    resize: { width: 960 },
  }),
  asset(BACKGROUND_SOURCE, 'src/assets/game/background-1440.webp', {
    lossyOptions: BACKGROUND,
    resize: { width: 1440 },
  }),
]

const groups = [
  { name: 'UI', jobs: uiJobs },
  { name: 'Icons', jobs: await iconJobs() },
  { name: 'Portraits', jobs: await portraitJobs() },
  { name: 'Background', jobs: backgroundJobs },
]

function formatBytes(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`
}

function pipelineFor(job) {
  let pipeline = sharp(job.input)
  if (job.extract) pipeline = pipeline.extract(job.extract)
  if (job.resize) pipeline = pipeline.resize(job.resize)
  return pipeline
}

async function rawFor(job) {
  return pipelineFor(job).ensureAlpha().raw().toBuffer()
}

async function verifyLossless(job) {
  const expected = await rawFor(job)
  const actual = await sharp(job.output).ensureAlpha().raw().toBuffer()
  if (expected.length !== actual.length) {
    throw new Error(`Pixel size mismatch: ${relative(root, job.output)}`)
  }
  for (let index = 0; index < expected.length; index += 4) {
    if (expected[index + 3] !== actual[index + 3]) {
      throw new Error(`Alpha mismatch: ${relative(root, job.output)}`)
    }
    if (
      expected[index + 3] !== 0 &&
      (expected[index] !== actual[index] ||
        expected[index + 1] !== actual[index + 1] ||
        expected[index + 2] !== actual[index + 2])
    ) {
      throw new Error(`Visible pixel mismatch: ${relative(root, job.output)}`)
    }
  }
}

const missing = []
const rows = []

for (const group of groups) {
  let groupSource = 0
  let groupOutput = 0
  const uniqueSources = new Set(group.jobs.map((job) => job.input))
  for (const source of uniqueSources) {
    groupSource += (await stat(source)).size
  }

  for (const job of group.jobs) {
    if (!existsSync(job.output)) {
      if (checkOnly) {
        missing.push(relative(root, job.output))
        continue
      }
    }

    if (!checkOnly) {
      await mkdir(dirname(job.output), { recursive: true })
      const pipeline = pipelineFor(job)
      const encoder = job.lossless
        ? pipeline.webp(LOSSLESS)
        : pipeline.webp(job.lossyOptions ?? PORTRAIT_SMALL)
      await encoder.toFile(job.output)
    }

    if (!existsSync(job.output)) continue
    const outputSize = (await stat(job.output)).size
    groupOutput += outputSize

    if (verify && job.lossless) {
      await verifyLossless(job)
    }

    if (group.name !== 'Icons') {
      const sourceSize = (await stat(job.input)).size
      rows.push({
        group: group.name,
        file: relative(root, job.output),
        source: formatBytes(sourceSize),
        output: formatBytes(outputSize),
        delta: `${(((outputSize - sourceSize) / sourceSize) * 100).toFixed(0)}%`,
      })
    }
  }

  if (group.name === 'Icons') {
    rows.push({
      group: group.name,
      file: `${group.jobs.length} files`,
      source: formatBytes(groupSource),
      output: formatBytes(groupOutput),
      delta: `${(((groupOutput - groupSource) / groupSource) * 100).toFixed(0)}%`,
    })
  }
}

if (missing.length > 0) {
  console.error(`Missing ${missing.length} generated asset(s):`)
  for (const file of missing) console.error(`  ${file}`)
  process.exitCode = 1
}

if (rows.length > 0) {
  console.table(rows)
}

if (!checkOnly) {
  const allJobs = groups.flatMap((group) => group.jobs)
  const uniqueSources = new Set(allJobs.map((job) => job.input))
  let sourceTotal = 0
  let outputTotal = 0
  for (const source of uniqueSources) sourceTotal += (await stat(source)).size
  for (const job of allJobs) {
    if (existsSync(job.output)) outputTotal += (await stat(job.output)).size
  }
  console.log(
    `Generated ${allJobs.length} WebP files from ${uniqueSources.size} sources: ${formatBytes(sourceTotal)} -> ${formatBytes(outputTotal)}.`,
  )
}

if (verify) {
  console.log('Lossless pixel verification passed.')
}
