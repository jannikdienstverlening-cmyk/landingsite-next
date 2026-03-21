import crypto from 'crypto'

const NETLIFY_API = 'https://api.netlify.com/api/v1'
const TOKEN = process.env.NETLIFY_ACCESS_TOKEN!

function slug(bedrijfsnaam: string): string {
  return bedrijfsnaam
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 40)
}

export async function deployNailSite(
  bedrijfsnaam: string,
  html: string
): Promise<{ siteId: string; siteUrl: string }> {
  // 1. Maak een nieuwe Netlify site aan
  const createRes = await fetch(`${NETLIFY_API}/sites`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: `${slug(bedrijfsnaam)}-${Date.now()}`,
    }),
  })
  if (!createRes.ok) {
    const err = await createRes.text()
    throw new Error(`Netlify site aanmaken mislukt: ${err}`)
  }
  const site = await createRes.json()

  // 2. Deploy via file digest API
  const htmlBuffer = Buffer.from(html, 'utf-8')
  const sha1 = crypto.createHash('sha1').update(htmlBuffer).digest('hex')

  const deployRes = await fetch(`${NETLIFY_API}/sites/${site.id}/deploys`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      files: { '/index.html': sha1 },
    }),
  })
  if (!deployRes.ok) {
    const err = await deployRes.text()
    throw new Error(`Netlify deploy aanmaken mislukt: ${err}`)
  }
  const deploy = await deployRes.json()

  // 3. Upload het HTML bestand
  const uploadRes = await fetch(
    `${NETLIFY_API}/deploys/${deploy.id}/files/index.html`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/octet-stream',
      },
      body: htmlBuffer,
    }
  )
  if (!uploadRes.ok) {
    const err = await uploadRes.text()
    throw new Error(`Netlify bestand uploaden mislukt: ${err}`)
  }

  return {
    siteId: site.id,
    siteUrl: `https://${site.subdomain}.netlify.app`,
  }
}
