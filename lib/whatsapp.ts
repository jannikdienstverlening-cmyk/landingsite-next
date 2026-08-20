type ChatHandoffMessage = {
  role: 'user' | 'assistant'
  content: string
}

export function normalizeWhatsAppNumber(value: string | null | undefined) {
  if (!value) return null

  let digits = value.replace(/\D/g, '')
  if (digits.startsWith('0031')) digits = digits.slice(2)
  if (digits.startsWith('310')) digits = `31${digits.slice(3)}`
  if (digits.startsWith('0') && digits.length === 10) digits = `31${digits.slice(1)}`

  return /^[1-9]\d{8,14}$/.test(digits) ? digits : null
}

export function buildWhatsAppHandoffMessage(messages: ChatHandoffMessage[]) {
  const questions = messages
    .filter((message) => message.role === 'user')
    .slice(-3)
    .map((message) => message.content.trim())
    .filter(Boolean)
    .join('\n')

  const introduction = 'Hoi Jannik, ik kom via de chat op Landingsite.nl.'
  return questions
    ? `${introduction}\n\nMijn vraag:\n${questions}`.slice(0, 1200)
    : `${introduction}\n\nIk heb een vraag over het laten maken van een website.`
}

export function createWhatsAppUrl(number: string | null | undefined, message: string) {
  const normalizedNumber = normalizeWhatsAppNumber(number)
  if (!normalizedNumber) return null

  const query = new URLSearchParams({ text: message.trim().slice(0, 1200) })
  return `https://wa.me/${normalizedNumber}?${query.toString()}`
}
