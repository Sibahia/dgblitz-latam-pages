import { readdir, readFile, stat } from 'node:fs/promises'
import { extname, join, relative, resolve } from 'node:path'

const root = process.cwd()
const dist = resolve(root, 'dist')
const errors = []

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const fullPath = join(directory, entry.name)
    if (entry.isDirectory()) files.push(...(await walk(fullPath)))
    else files.push(fullPath)
  }
  return files
}

let files
try {
  files = await walk(dist)
} catch {
  console.error('dist/ does not exist. Run pnpm build first.')
  process.exit(1)
}

const images = files.filter((file) => /\.(png|jpe?g|gif|webp|avif)$/i.test(file))
const legacyImages = images.filter((file) => /\.(png|jpe?g|gif)$/i.test(file))
if (legacyImages.length > 0) {
  errors.push(`Legacy raster files in dist: ${legacyImages.map((file) => relative(root, file)).join(', ')}`)
}

for (const file of files.filter((entry) => /\.(js|css)$/i.test(entry))) {
  const content = await readFile(file, 'utf8')
  if (content.includes('data:image')) {
    errors.push(`Inline image data found in ${relative(root, file)}`)
  }
}

const oversized = []
for (const file of images) {
  const size = (await stat(file)).size
  if (size > 200 * 1024) oversized.push(`${relative(root, file)} (${(size / 1024).toFixed(1)} KB)`)
}
if (oversized.length > 0) {
  errors.push(`Images over 200 KB: ${oversized.join(', ')}`)
}

const webpBytes = (
  await Promise.all(
    images
      .filter((file) => extname(file).toLowerCase() === '.webp')
      .map(async (file) => (await stat(file)).size),
  )
).reduce((total, size) => total + size, 0)

if (errors.length > 0) {
  for (const error of errors) console.error(error)
  process.exit(1)
}

console.log(`dist asset check passed: ${images.length} images, ${(webpBytes / 1024).toFixed(1)} KB WebP.`)
