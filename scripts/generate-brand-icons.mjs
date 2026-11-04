import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = new URL('../', import.meta.url)
const mark = await readFile(new URL('public/brand/landingsite-mark.svg', root))

for (const file of ['app/icon.svg', 'public/favicon.svg']) {
  await writeFile(new URL(file, root), mark)
}

for (const [file, size] of [
  ['public/favicon-16x16.png', 16],
  ['public/favicon-32x32.png', 32],
  ['public/favicon.png', 64],
  ['app/apple-icon.png', 180],
  ['public/apple-touch-icon.png', 180],
  ['public/icon-192.png', 192],
  ['public/icon-512.png', 512],
  ['public/brand/landingsite-mark-192.png', 192],
  ['public/brand/landingsite-mark-512.png', 512],
]) {
  await sharp(mark, { density: 600 }).resize(size, size).png().toFile(fileURLToPath(new URL(file, root)))
}

console.log('Groen beeldmerk, favicons en app-iconen gegenereerd uit één SVG-bron.')
