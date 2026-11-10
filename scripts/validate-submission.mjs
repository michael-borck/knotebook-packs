import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = 'submissions'
const errors = []
const ids = new Set()

function fail(message) {
  errors.push(message)
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

  if (typeof submission.submittedBy !== 'string' || !submission.submittedBy.trim()) {
    fail(`${item.name}: submittedBy is required`)
  }
  if (submission.licenceConfirmed !== true) {
    fail(`${item.name}: licenceConfirmed must be true`)
  }

  const packFile =
    typeof submission.packFile === 'string'
      ? submission.packFile
      : 'pack.knotebook.json'
  const packPath = join(dir, packFile)

  if (!existsSync(packPath)) {
    fail(`${item.name}: missing ${packFile}`)
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
  if (typeof pack.id !== 'string' || !pack.id) {
    fail(`${item.name}: pack.id is required`)
  } else if (ids.has(pack.id)) {
    fail(`${item.name}: duplicate pack id ${pack.id}`)
  } else {
    ids.add(pack.id)
  }
  if (typeof pack.title !== 'string' || !pack.title) {
    fail(`${item.name}: pack.title is required`)
  }
  if (typeof pack.theme !== 'string' || !pack.theme) {
    fail(`${item.name}: pack.theme is required`)
  }
  if (typeof pack.licence !== 'string' || !pack.licence.trim()) {
    fail(`${item.name}: pack.licence is required`)
  }
  if (!Array.isArray(pack.stories) || pack.stories.length === 0) {
    fail(`${item.name}: pack.stories must be non-empty`)
  } else {
    for (const story of pack.stories) {
      if (
        !story ||
        typeof story !== 'object' ||
        typeof story.id !== 'string' ||
        typeof story.json !== 'string'
      ) {
        fail(`${item.name}: each story needs id and json`)
      }
    }
  }
}

if (errors.length > 0) {
  for (const error of errors) console.error(`✗ ${error}`)
  process.exit(1)
}

console.log(`✓ ${ids.size} submission(s) valid`)
