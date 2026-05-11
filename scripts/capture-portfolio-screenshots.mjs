import { spawn } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'

const viewport = { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false }
const outputDir = path.resolve('public/images/portfolio')

const targets = [
  {
    url: 'https://www.wiamanagement.nl/',
    fileName: 'wiamanagement-screenshot.webp',
  },
  {
    url: 'https://www.ontwikkelbegeleiding.nl/',
    fileName: 'ontwikkelbegeleiding-screenshot.webp',
  },
]

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function findChromeExecutable() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH

  if (process.platform === 'win32') {
    const localAppData = process.env.LOCALAPPDATA
    if (localAppData) {
      return path.join(
        localAppData,
        'ms-playwright',
        'chromium-1208',
        'chrome-win64',
        'chrome.exe',
      )
    }
  }

  if (process.platform === 'darwin') {
    return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  }

  return 'google-chrome'
}

async function connectToChrome(port) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json`)
      if (response.ok) {
        const tabs = await response.json()
        if (tabs[0]?.webSocketDebuggerUrl) return tabs[0].webSocketDebuggerUrl
      }
    } catch {
      // Chrome is still starting.
    }

    await sleep(100)
  }

  throw new Error('Chrome DevTools endpoint was not available in time.')
}

function createCdpClient(wsUrl) {
  const socket = new WebSocket(wsUrl)
  let id = 0
  const pending = new Map()

  socket.onmessage = (event) => {
    const message = JSON.parse(event.data)

    if (!message.id || !pending.has(message.id)) return

    const { resolve, reject } = pending.get(message.id)
    pending.delete(message.id)

    if (message.error) reject(new Error(JSON.stringify(message.error)))
    else resolve(message.result)
  }

  const ready = new Promise((resolve, reject) => {
    socket.onopen = resolve
    socket.onerror = reject
  })

  return {
    ready,
    send(method, params = {}) {
      const messageId = (id += 1)
      socket.send(JSON.stringify({ id: messageId, method, params }))
      return new Promise((resolve, reject) => pending.set(messageId, { resolve, reject }))
    },
    close() {
      socket.close()
    },
  }
}

async function waitForPageReady(send) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    const result = await send('Runtime.evaluate', {
      returnByValue: true,
      expression: `document.readyState === 'complete' && [...document.images].every((image) => image.complete)`,
    })

    if (result.result.value) break
    await sleep(150)
  }

  await sleep(1200)
}

async function dismissCookieBanners(send) {
  await send('Runtime.evaluate', {
    awaitPromise: true,
    expression: `(() => {
      const labels = ['accepteren', 'accept', 'akkoord', 'allow all', 'alles accepteren'];
      for (const button of document.querySelectorAll('button, [role="button"], a')) {
        const text = (button.textContent || '').trim().toLowerCase();
        if (labels.some((label) => text.includes(label))) {
          button.click();
          return true;
        }
      }
      return false;
    })()`,
  })

  await sleep(500)
}

async function captureTarget(send, target) {
  await send('Page.navigate', { url: target.url })
  await waitForPageReady(send)
  await dismissCookieBanners(send)
  await send('Runtime.evaluate', { expression: 'window.scrollTo(0, 0)' })
  await sleep(300)

  const screenshot = await send('Page.captureScreenshot', {
    format: 'png',
    fromSurface: true,
    captureBeyondViewport: false,
  })

  const pngBuffer = Buffer.from(screenshot.data, 'base64')
  const outputPath = path.join(outputDir, target.fileName)

  const sharp = (await import('sharp')).default
  await sharp(pngBuffer).webp({ quality: 82 }).toFile(outputPath)

  return outputPath
}

await fs.mkdir(outputDir, { recursive: true })

const port = 12300 + Math.floor(Math.random() * 1000)
const profileDir = path.resolve('.tmp-portfolio-chrome-profile')
await fs.rm(profileDir, { recursive: true, force: true })
await fs.mkdir(profileDir, { recursive: true })

const chrome = spawn(
  findChromeExecutable(),
  [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--no-sandbox',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profileDir}`,
    'about:blank',
  ],
  { stdio: 'ignore' },
)

try {
  const wsUrl = await connectToChrome(port)
  const cdp = createCdpClient(wsUrl)
  await cdp.ready

  await cdp.send('Page.enable')
  await cdp.send('Runtime.enable')
  await cdp.send('Network.enable')
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true })
  await cdp.send('Emulation.setDeviceMetricsOverride', viewport)

  for (const target of targets) {
    const outputPath = await captureTarget(cdp.send, target)
    console.log(`Captured ${target.url} -> ${outputPath}`)
  }

  cdp.close()
} finally {
  const chromeExited = new Promise((resolve) => chrome.once('exit', resolve))
  chrome.kill()
  await Promise.race([chromeExited, sleep(2000)])

  let removed = false
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      await fs.rm(profileDir, { recursive: true, force: true })
      removed = true
      break
    } catch {
      await sleep(500)
    }
  }

  if (!removed) console.warn(`Could not remove temporary Chrome profile at ${profileDir}.`)
}
