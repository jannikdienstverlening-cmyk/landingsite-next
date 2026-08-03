import 'server-only'

function configuredEmail(name: 'ADMIN_EMAIL' | 'CONTACT_EMAIL') {
  const value = process.env[name]?.trim()
  return value || null
}

export function adminRecipient() {
  const email = configuredEmail('ADMIN_EMAIL')
  if (!email) throw new Error('ADMIN_EMAIL ontbreekt.')
  return email
}

export function contactRecipient() {
  return configuredEmail('CONTACT_EMAIL') ?? adminRecipient()
}
