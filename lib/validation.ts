import { z } from 'zod'

export const packageSchema = z.enum(['starter', 'pro', 'premium'])

const optionalUrl = z.union([z.literal(''), z.url().max(2_048)])
const optionalShort = z.string().trim().max(160).default('')
const optionalText = z.string().trim().max(2_000).default('')

export const checkoutSchema = z.object({
  pakket: packageSchema,
  requestId: z.uuid(),
  termsAccepted: z.literal(true),
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
  website: z.string().max(200).optional(),
}).strict()

export const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().trim().min(1).max(800),
}).strict()

export const chatSchema = z.object({
  messages: z.array(chatMessageSchema).min(1).max(10),
}).strict().superRefine((value, context) => {
  if (value.messages.at(-1)?.role !== 'user') {
    context.addIssue({ code: 'custom', path: ['messages'], message: 'Het laatste bericht moet van de bezoeker zijn.' })
  }

  for (let index = 1; index < value.messages.length; index += 1) {
    if (value.messages[index]?.role === value.messages[index - 1]?.role) {
      context.addIssue({ code: 'custom', path: ['messages', index], message: 'Berichten moeten elkaar afwisselen.' })
      break
    }
  }
})

export const partnerApplicationSchema = z.object({
  requestId: z.uuid(),
  voornaam: z.string().trim().min(2).max(80),
  achternaam: z.string().trim().min(2).max(100),
  email: z.email().max(254),
  telefoon: z.string().trim().max(40).default(''),
  type: z.enum(['particulier', 'ondernemer']),
  bedrijfsnaam: z.string().trim().max(120).default(''),
  kvkNummer: z.string().trim().max(20).default(''),
  btwNummer: z.string().trim().max(32).default(''),
  termsAccepted: z.literal(true),
  privacyAccepted: z.literal(true),
  website: z.string().max(0).optional(),
}).strict().superRefine((value, context) => {
  if (value.type === 'ondernemer' && value.bedrijfsnaam.length < 2) {
    context.addIssue({ code: 'custom', path: ['bedrijfsnaam'], message: 'Bedrijfsnaam ontbreekt.' })
  }
  if (value.type === 'ondernemer' && !/^\d{8}$/.test(value.kvkNummer.replace(/\s/g, ''))) {
    context.addIssue({ code: 'custom', path: ['kvkNummer'], message: 'KvK-nummer moet uit 8 cijfers bestaan.' })
  }
})

export const referralCaptureSchema = z.object({
  code: z.string().trim().toUpperCase().regex(/^[A-Z0-9-]{6,32}$/),
  landingPath: z.string().trim().min(1).max(500),
  utmSource: z.string().trim().max(120).default(''),
  utmMedium: z.string().trim().max(120).default(''),
  utmCampaign: z.string().trim().max(160).default(''),
}).strict()

export const managementActivationSchema = z.object({
  order_id: z.uuid(),
  requestId: z.uuid(),
}).strict()

export const customerManagementSchema = z.object({
  order_id: z.uuid(),
  token: z.string().min(40).max(600),
}).strict()

export const customerManagementCheckoutSchema = customerManagementSchema.extend({
  requestId: z.uuid(),
  termsAccepted: z.literal(true),
}).strict()

export const partnerDecisionSchema = z.object({
  partner_id: z.uuid(),
  decision: z.enum(['approve', 'reject']),
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
