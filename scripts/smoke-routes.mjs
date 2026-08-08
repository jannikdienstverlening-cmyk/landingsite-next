import process from 'node:process'

const baseUrl = (process.env.SMOKE_BASE_URL || 'http://127.0.0.1:3001').replace(/\/$/, '')
const routes = ['/', '/werk', '/start', '/algemene-voorwaarden', '/privacybeleid']
const forbidden = ['Lisa van Studio Noord', '+38% conversie', 'Performance 98', 'Premium AI-webbureau']

for (const route of routes) {
  const response = await fetch(`${baseUrl}${route}`, { redirect: 'follow' })
  if (!response.ok) throw new Error(`${route} antwoordt met ${response.status}.`)
  const html = await response.text()
  if (!html.toLocaleLowerCase('nl-NL').includes('landingsite')) throw new Error(`${route} bevat het merk niet.`)
  for (const claim of forbidden) {
    if (html.toLocaleLowerCase('nl-NL').includes(claim.toLocaleLowerCase('nl-NL'))) {
      throw new Error(`${route} bevat verboden claim "${claim}".`)
    }
  }
  console.log(`OK ${route}`)
}

