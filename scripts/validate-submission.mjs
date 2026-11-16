import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { isAbsolute, join, resolve, sep } from 'node:path'

const root = 'submissions'
const MAX_PACK_BYTES = 16 * 1024 * 1024
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const RELEASE = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/
const errors = []
const ids = new Set()

function fail(message) {
  errors.push(message)
}

function isDataUrl(value) {
  return typeof value === 'string' && value.startsWith('data:')
}

function checkAssets(name, assets) {
  if (assets === undefined) return
  if (typeof assets !== 'object' || assets === null || Array.isArray(assets)) {
    fail(`${name}: pack.assets must be an object`)
    return
  }
  for (const [key, value] of Object.entries(assets)) {
    if (isAbsolute(key) || key.split(/[\\/]/).includes('..')) {
      fail(`${name}: asset path ${key} must be relative`)
    }
    if (!isDataUrl(value)) {
      fail(`${name}: asset ${key} must be a data URL`)
    }
  }
}

if (!existsSync(root)) {
  console.log('No submissions directory; nothing to validate.')
  process.exit(0)
}

for (const item of readdirSync(root, { withFileTypes: true })) {
  if (!item.isDirectory() || item.name.startsWith('.')) continue
  const dir = join(root, item.name)
  const submissionPath = join(dir, 'submission.json')

  if (!existsSync(submissionPath)) {
    fail(`${item.name}: missing submission.json`)
    continue
  }

  let submission
  try {
    submission = JSON.parse(readFileSync(submissionPath, 'utf8'))
  } catch {
    fail(`${item.name}: submission.json is invalid JSON`)
    continue
  }

  if (
    typeof submission.submittedBy !== 'string' ||
    !submission.submittedBy.trim()
  ) {
    fail(`${item.name}: submittedBy is required`)
  }
  if (submission.licenceConfirmed !== true) {
    fail(`${item.name}: licenceConfirmed must be true`)
  }

  const packFile =
    typeof submission.packFile === 'string' && submission.packFile.trim()
      ? submission.packFile
      : 'pack.knotebook.json'
  if (isAbsolute(packFile) || packFile.split(/[\\/]/).includes('..')) {
    fail(`${item.name}: packFile must stay inside the submission folder`)
    continue
  }

  const packPath = resolve(dir, packFile)
  if (!packPath.startsWith(resolve(dir) + sep)) {
    fail(`${item.name}: packFile must stay inside the submission folder`)
    continue
  }
  if (!existsSync(packPath)) {
    fail(`${item.name}: missing ${packFile}`)
    continue
  }
  if (statSync(packPath).size > MAX_PACK_BYTES) {
    fail(`${item.name}: pack exceeds the 16 MB limit`)
    continue
  }

  let pack
  try {
    pack = JSON.parse(readFileSync(packPath, 'utf8'))
  } catch {
    fail(`${item.name}: pack is invalid JSON`)
    continue
  }

  if (pack.format !== 'knotebook-pack') {
    fail(`${item.name}: pack format must be knotebook-pack`)
  }
  if (pack.version !== 1) {
    fail(`${item.name}: pack version must be 1`)
  }
  if (typeof pack.id !== 'string' || !SLUG.test(pack.id)) {
    fail(`${item.name}: pack.id must be a lowercase slug`)
  } else if (pack.id !== item.name) {
    fail(`${item.name}: folder name must match pack.id (${pack.id})`)
  } else if (ids.has(pack.id)) {
    fail(`${item.name}: duplicate pack id ${pack.id}`)
  } else {
    ids.add(pack.id)
  }
  if (typeof pack.title !== 'string' || !pack.title.trim()) {
    fail(`${item.name}: pack.title is required`)
  }
  if (typeof pack.author !== 'string') {
    fail(`${item.name}: pack.author is required`)
  }
  if (typeof pack.theme !== 'string' || !pack.theme.trim()) {
    fail(`${item.name}: pack.theme is required`)
  }
  if (typeof pack.licence !== 'string' || !pack.licence.trim()) {
    fail(`${item.name}: pack.licence is required`)
  }
  if (typeof pack.release !== 'string' || !RELEASE.test(pack.release)) {
    fail(`${item.name}: pack.release must be a semver string`)
  }
  if (pack.cover !== undefined && !isDataUrl(pack.cover)) {
    fail(`${item.name}: pack.cover must be a data URL`)
  }
  checkAssets(item.name, pack.assets)

  if (!Array.isArray(pack.stories) || pack.stories.length === 0) {
    fail(`${item.name}: pack.stories must be non-empty`)
  } else {
    const storyIds = new Set()
    for (const story of pack.stories) {
      if (
        !story ||
        typeof story !== 'object' ||
        typeof story.id !== 'string' ||
        !story.id ||
        typeof story.title !== 'string' ||
        typeof story.json !== 'string' ||
        !story.json
      ) {
        fail(`${item.name}: each story needs id, title and json`)
        continue
      }
      if (storyIds.has(story.id)) {
        fail(`${item.name}: duplicate story id ${story.id}`)
      }
      storyIds.add(story.id)
      try {
        const parsed = JSON.parse(story.json)
        if (typeof parsed !== 'object' || parsed === null) {
          fail(`${item.name}: story ${story.id} json must be an object`)
        }
      } catch {
        fail(`${item.name}: story ${story.id} json is not valid JSON`)
      }
    }
  }
}

if (errors.length > 0) {
  for (const error of errors) console.error(`✗ ${error}`)
  process.exit(1)
}

console.log(`✓ ${ids.size} submission(s) valid`)