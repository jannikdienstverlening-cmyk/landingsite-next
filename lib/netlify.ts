import { createHash } from 'node:crypto'

const NETLIFY_API = 'https://api.netlify.com/api/v1'

function getToken() {
  const token = process.env.NETLIFY_ACCESS_TOKEN
  if (!token) throw new Error('NETLIFY_ACCESS_TOKEN ontbreekt.')
  return token
}

function headers(json = false) {
  return {
    Authorization: `Bearer ${getToken()}`,
    ...(json ? { 'Content-Type': 'application/json' } : {}),
  }
}

function slug(value: string) {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 35) || 'landingsite'
}

type NetlifySite = { id: string; name?: string; subdomain?: string; ssl_url?: string; url?: string }

export async function ensureNetlifySite(opts: {
  bedrijfsnaam: string
  pageId: string
  existingSiteId?: string | null
  existingUrl?: string | null
}) {
  if (opts.existingSiteId && opts.existingUrl) return { siteId: opts.existingSiteId, siteUrl: opts.existingUrl }

  const name = `${slug(opts.bedrijfsnaam)}-${opts.pageId.replaceAll('-', '').slice(0, 10)}`
  const listResponse = await fetch(`${NETLIFY_API}/sites?name=${encodeURIComponent(name)}`, { headers: headers() })
  if (listResponse.ok) {
    const sites = await listResponse.json() as NetlifySite[]
    const existing = sites.find(site => site.name === name || site.subdomain === name)
    if (existing) return siteResult(existing)
  }

  const response = await fetch(`${NETLIFY_API}/sites`, {
    method: 'POST',
    headers: headers(true),
    body: JSON.stringify({ name }),
  })
  if (!response.ok) throw new Error(`Netlify-site aanmaken mislukt (${response.status}): ${await response.text()}`)
  return siteResult(await response.json() as NetlifySite)
}

function siteResult(site: NetlifySite) {
  if (!site.id) throw new Error('Netlify gaf geen site-ID terug.')
  const siteUrl = site.ssl_url ?? site.url ?? (site.subdomain ? `https://${site.subdomain}.netlify.app` : '')
  if (!siteUrl) throw new Error('Netlify gaf geen site-URL terug.')
  return { siteId: site.id, siteUrl }
}

export async function deployToNetlifySite(siteId: string, html: string) {
  const htmlBuffer = Buffer.from(html, 'utf8')
  const digest = createHash('sha1').update(htmlBuffer).digest('hex')
  const deployResponse = await fetch(`${NETLIFY_API}/sites/${encodeURIComponent(siteId)}/deploys`, {
    method: 'POST',
    headers: headers(true),
    body: JSON.stringify({ files: { '/index.html': digest } }),
  })
  if (!deployResponse.ok) throw new Error(`Netlify-deploy aanmaken mislukt (${deployResponse.status}): ${await deployResponse.text()}`)

  const deploy = await deployResponse.json() as { id?: string; required?: string[] }
  if (!deploy.id) throw new Error('Netlify gaf geen deploy-ID terug.')
  if (deploy.required?.includes(digest)) {
    const uploadResponse = await fetch(`${NETLIFY_API}/deploys/${encodeURIComponent(deploy.id)}/files/index.html`, {
      method: 'PUT',
      headers: { ...headers(), 'Content-Type': 'text/html; charset=utf-8' },
      body: htmlBuffer,
    })
    if (!uploadResponse.ok) throw new Error(`Netlify-upload mislukt (${uploadResponse.status}): ${await uploadResponse.text()}`)
  }
  return { deployId: deploy.id }
}
