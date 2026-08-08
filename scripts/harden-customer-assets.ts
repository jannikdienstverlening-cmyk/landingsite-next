import { readFile } from 'node:fs/promises'
import { createClient } from '@supabase/supabase-js'

async function loadLocalEnvironment() {
  for (const filename of ['.env.local', '.env.production.local']) {
    try {
      const text = await readFile(filename, 'utf8')
      for (const rawLine of text.split(/\r?\n/)) {
        const line = rawLine.trim()
        if (!line || line.startsWith('#')) continue
        const separator = line.indexOf('=')
        if (separator < 1) continue
        const key = line.slice(0, separator).trim()
        const value = line.slice(separator + 1).trim().replace(/^['"]|['"]$/g, '')
        if (!(key in process.env)) process.env[key] = value
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
    }
  }
}

async function main() {
  await loadLocalEnvironment()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase-configuratie ontbreekt.')

  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  const options = {
    public: false,
    fileSizeLimit: 5 * 1024 * 1024,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  }
  const { data: current } = await supabase.storage.getBucket('customer-assets')
  const operation = current
    ? supabase.storage.updateBucket('customer-assets', options)
    : supabase.storage.createBucket('customer-assets', options)
  const { error } = await operation
  if (error) throw error

  const { data: bucket, error: verifyError } = await supabase.storage.getBucket('customer-assets')
  if (verifyError || !bucket || bucket.public) throw verifyError ?? new Error('Klantbucket is nog openbaar.')
  console.log(JSON.stringify({ bucket: bucket.name, public: bucket.public, fileSizeLimit: bucket.file_size_limit }, null, 2))
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
