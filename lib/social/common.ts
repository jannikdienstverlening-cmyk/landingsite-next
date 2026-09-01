export type FetchLike = typeof fetch

export class SocialApiError extends Error {
  constructor(
    message: string,
    readonly platform: 'instagram' | 'tiktok',
    readonly status: number,
    readonly code?: string,
  ) {
    super(message)
    this.name = 'SocialApiError'
  }
}

export function assertHttpsUrl(value: string, label: string) {
  let parsed: URL
  try {
    parsed = new URL(value)
  } catch {
    throw new Error(`${label} is geen geldige URL.`)
  }
  if (parsed.protocol !== 'https:') throw new Error(`${label} moet HTTPS gebruiken.`)
  return parsed.toString()
}

export async function responseJson(response: Response): Promise<Record<string, unknown>> {
  const text = await response.text()
  if (!text) return {}
  try {
    return JSON.parse(text) as Record<string, unknown>
  } catch {
    return {}
  }
}

export function sleep(milliseconds: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, milliseconds))
}

export function requiredEnv(name: string) {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`${name} ontbreekt.`)
  return value
}

export function envEnabled(name: string) {
  return process.env[name]?.trim().toLowerCase() === 'true'
}
