import 'server-only'
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod'
import { z } from 'zod'
import { aiConfigured, getLeadEngineAiClient } from './client'

const schema = z.object({
  designScore: z.number().int().min(0).max(100),
  looksOutdated: z.boolean(),
  trust: z.string().min(10).max(240),
  hierarchy: z.string().min(10).max(240),
  readability: z.string().min(10).max(240),
  textAmount: z.string().min(10).max(240),
  photography: z.string().min(10).max(240),
  ctas: z.string().min(10).max(240),
  mobileExperience: z.string().min(10).max(240),
  conversionFocus: z.string().min(10).max(240),
  summary: z.string().min(20).max(500),
})

export type VisualAssessment = z.infer<typeof schema>

export async function assessWebsiteVisual(screenshotDataUrl: string | null): Promise<VisualAssessment | null> {
  if (!screenshotDataUrl || !aiConfigured()) return null
  const match = screenshotDataUrl.match(/^data:(image\/(?:png|jpeg|webp|gif));base64,(.+)$/)
  if (!match) return null
  const mediaType = match[1] as 'image/png' | 'image/jpeg' | 'image/webp' | 'image/gif'
  const response = await getLeadEngineAiClient().messages.parse({
    model: process.env.ANTHROPIC_VISION_MODEL ?? process.env.ANTHROPIC_LEAD_MODEL ?? 'claude-opus-4-6',
    max_tokens: 1_500,
    system: 'Je beoordeelt uitsluitend wat zichtbaar is in een mobiele website-screenshot. Wees concreet, zakelijk en terughoudend. Verzin geen niet-zichtbare functionaliteit of bedrijfsfeiten.',
    messages: [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: mediaType, data: match[2] } },
        { type: 'text', text: 'Beoordeel ontwerp, vertrouwen, hiërarchie, leesbaarheid, teksthoeveelheid, fotografie, CTA’s, mobiele ervaring en conversiegerichtheid.' },
      ],
    }],
    output_config: { format: zodOutputFormat(schema) },
  })
  return response.parsed_output
}
