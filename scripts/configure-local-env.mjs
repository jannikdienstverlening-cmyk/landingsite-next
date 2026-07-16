import { randomBytes } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const envPath = resolve(process.argv[2] ?? '.env.local')
const source = existsSync(envPath) ? readFileSync(envPath, 'utf8') : ''
const lines = source ? source.replace(/\r\n/g, '\n').split('\n') : []
const indexByKey = new Map()

for (let index = 0; index < lines.length; index += 1) {
  const match = lines[index].match(/^([A-Za-z_][A-Za-z0-9_]*)=/)
  if (match) indexByKey.set(match[1], index)
}

function valueFor(key) {
  const index = indexByKey.get(key)
  if (index === undefined) return ''
  return lines[index].slice(lines[index].indexOf('=') + 1)
}

function setValue(key, value, { onlyWhenMissing = false } = {}) {
  if (onlyWhenMissing && valueFor(key)) return
  const nextLine = `${key}=${value}`
  const index = indexByKey.get(key)
  if (index === undefined) {
    if (lines.length && lines.at(-1) !== '') lines.push('')
    indexByKey.set(key, lines.length)
    lines.push(nextLine)
    return
  }
  lines[index] = nextLine
}

const secureRandom = () => randomBytes(48).toString('base64url')

setValue('ANTHROPIC_MODEL', 'claude-opus-4-6', { onlyWhenMissing: true })
setValue('RESEND_FROM', 'Landingsite.nl <noreply@landingsite.nl>', { onlyWhenMissing: true })
setValue('ADMIN_SESSION_SECRET', secureRandom(), { onlyWhenMissing: true })
setValue('ORDER_TOKEN_SECRET', secureRandom(), { onlyWhenMissing: true })
setValue('IP_HASH_SALT', secureRandom(), { onlyWhenMissing: true })
setValue('ADMIN_EMAIL', 'jannikklumpenaar@gmail.com', { onlyWhenMissing: true })
setValue('CONTACT_EMAIL', 'info@landingsite.nl', { onlyWhenMissing: true })
setValue('STRIPE_TERMS_CONFIGURED', process.argv.includes('--terms-configured') ? 'true' : valueFor('STRIPE_TERMS_CONFIGURED') || 'false')

writeFileSync(envPath, `${lines.join('\n').replace(/\n+$/, '')}\n`, { encoding: 'utf8', mode: 0o600 })
console.log(`Configured ${envPath} without printing secret values.`)
