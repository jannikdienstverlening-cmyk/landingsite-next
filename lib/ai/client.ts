import 'server-only'
import Anthropic from '@anthropic-ai/sdk'

let client: Anthropic | null = null

export function aiConfigured() {
  return Boolean(process.env.ANTHROPIC_API_KEY)
}

export function getLeadEngineAiClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY ontbreekt.')
  client ??= new Anthropic({ apiKey })
  return client
}
