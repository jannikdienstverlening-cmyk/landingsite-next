import { z } from 'zod'

export const packageSchema = z.enum(['starter', 'pro', 'premium'])

const optionalUrl = z.union([z.literal(''), z.url().max(2_048)])
const optionalShort = z.string().trim().max(160).default('')
const optionalText = z.string().trim().max(2_000).default('')

export const checkoutSchema = z.object({
  pakket: packageSchema,
}).strict()

export const intakeFormSchema = z.object({
  bedrijfsnaam: z.string().trim().min(2).max(100),
  niche: z.string().trim().min(2).max(120),
  beschrijving: z.string().trim().min(30).max(3_500),
  usp_1: z.string().trim().min(3).max(220),
  usp_2: optionalShort,
  usp_3: optionalShort,
  contacttelefoon: optionalShort,
  contactemail: z.email().max(254),
  doelgroep: optionalText,
  werkgebied: optionalShort,
  social_facebook: optionalUrl,
  social_instagram: optionalUrl,
  social_linkedin: optionalUrl,
  testimonial_1_naam: optionalShort,
  testimonial_1_tekst: optionalText,
  testimonial_2_naam: optionalShort,
  testimonial_2_tekst: optionalText,
  faq_1_vraag: optionalShort,
  faq_1_antwoord: optionalText,
  faq_2_vraag: optionalShort,
  faq_2_antwoord: optionalText,
  faq_3_vraag: optionalShort,
  faq_3_antwoord: optionalText,
  extra_wensen: optionalText,
  sfeer: optionalShort,
  logo_url: optionalUrl,
  hero_image_url: optionalUrl,
}).strict()

export const intakeSchema = z.object({
  session_id: z.string().trim().min(10).max(300),
  form: intakeFormSchema,
}).strict()

export const generateSchema = z.object({
  session_id: z.string().trim().min(10).max(300),
}).strict()

export const adminLoginSchema = z.object({
  password: z.string().min(1).max(300),
}).strict()

export const adminRegenerateSchema = z.object({
  order_id: z.uuid(),
}).strict()

export const contactSchema = z.object({
  naam: z.string().trim().min(2).max(100),
  email: z.email().max(254),
  bedrijf: z.string().trim().max(100).default(''),
  bericht: z.string().trim().min(10).max(3_000),
  website: z.string().max(0).optional(),
}).strict()

export const leadSchema = z.object({
  token: z.string().min(20).max(200),
  naam: z.string().trim().min(2).max(100),
  email: z.email().max(254),
  telefoon: z.string().trim().max(40).default(''),
  bericht: z.string().trim().max(2_000).default(''),
  website: z.string().max(0).optional(),
}).strict()

export function validationMessage(error: z.ZodError) {
  const first = error.issues[0]
  return first?.path.length ? `Controleer ${first.path.join('.')}.` : 'Controleer de ingevulde gegevens.'
}
