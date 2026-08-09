function fold(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('nl-NL')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\b(bv|b v|vof|v o f|eenmanszaak|holding|nederland)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function normalizeBusinessName(value: string) {
  return fold(value)
}

export function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, '')
  if (!digits.startsWith('31')) return digits
  const national = digits.slice(2).replace(/^0/, '')
  return `0${national}`
}

export function normalizeDomain(value: string) {
  try {
    return new URL(value.includes('://') ? value : `https://${value}`).hostname.replace(/^www\./, '').toLowerCase()
  } catch {
    return fold(value).replace(/\s/g, '')
  }
}

function levenshtein(left: string, right: string) {
  if (!left.length) return right.length
  if (!right.length) return left.length
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index)
  for (let i = 1; i <= left.length; i += 1) {
    let diagonal = previous[0]
    previous[0] = i
    for (let j = 1; j <= right.length; j += 1) {
      const above = previous[j]
      previous[j] = left[i - 1] === right[j - 1]
        ? diagonal
        : Math.min(previous[j - 1], previous[j], diagonal) + 1
      diagonal = above
    }
  }
  return previous[right.length]
}

export function stringSimilarity(left: string | null | undefined, right: string | null | undefined) {
  if (!left || !right) return 0
  const a = fold(left)
  const b = fold(right)
  if (!a || !b) return 0
  if (a === b) return 1
  const editScore = 1 - levenshtein(a, b) / Math.max(a.length, b.length)
  const aTokens = new Set(a.split(' '))
  const bTokens = new Set(b.split(' '))
  const overlap = [...aTokens].filter((token) => bTokens.has(token)).length
  const union = new Set([...aTokens, ...bTokens]).size
  const tokenScore = union ? overlap / union : 0
  return Math.max(0, Math.min(1, editScore * 0.6 + tokenScore * 0.4))
}

export function candidateConfidence(input: {
  companyName: string
  candidateName: string
  place: string
  candidateAddress?: string | null
  address?: string | null
  phone?: string | null
  candidatePhone?: string | null
  website?: string | null
  candidateWebsite?: string | null
}) {
  const name = stringSimilarity(input.companyName, input.candidateName)
  const place = input.candidateAddress?.toLocaleLowerCase('nl-NL').includes(input.place.toLocaleLowerCase('nl-NL')) ? 1 : 0
  const address = input.address ? stringSimilarity(input.address, input.candidateAddress) : 0
  const phone = input.phone && input.candidatePhone && normalizePhone(input.phone) === normalizePhone(input.candidatePhone) ? 1 : 0
  const domain = input.website && input.candidateWebsite && normalizeDomain(input.website) === normalizeDomain(input.candidateWebsite) ? 1 : 0
  return Math.max(0, Math.min(1, name * 0.52 + place * 0.2 + address * 0.13 + phone * 0.1 + domain * 0.05))
}
