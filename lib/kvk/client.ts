import 'server-only'
import type {
  KvkBasisProfile,
  KvkEstablishmentProfile,
  KvkSearchResponse,
} from './types'

const DEFAULT_BASE_URL = 'https://api.kvk.nl/api'

export class KvkApiError extends Error {
  constructor(message: string, readonly status: number, readonly retryable: boolean) {
    super(message)
    this.name = 'KvkApiError'
  }
}

export class KvkClient {
  private readonly apiKey: string
  private readonly baseUrl: string

  constructor(options: { apiKey?: string; baseUrl?: string } = {}) {
    this.apiKey = options.apiKey ?? process.env.KVK_API_KEY ?? ''
    this.baseUrl = (options.baseUrl ?? process.env.KVK_API_BASE_URL ?? DEFAULT_BASE_URL).replace(/\/$/, '')
    if (!this.apiKey) throw new Error('KVK_API_KEY ontbreekt.')
  }

  private async request<T>(path: string, query?: URLSearchParams): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`)
    if (query) url.search = query.toString()
    const response = await fetch(url, {
      headers: { apikey: this.apiKey, Accept: 'application/json' },
      signal: AbortSignal.timeout(20_000),
      cache: 'no-store',
    })
    if (!response.ok) {
      const retryable = response.status === 429 || response.status >= 500
      throw new KvkApiError(`KVK API gaf status ${response.status}.`, response.status, retryable)
    }
    return response.json() as Promise<T>
  }

  search(input: {
    place?: string
    kvkNumber?: string
    establishmentNumber?: string
    includeInactive?: boolean
    page?: number
    resultsPerPage?: number
    types?: Array<'hoofdvestiging' | 'nevenvestiging' | 'rechtspersoon'>
  }) {
    const query = new URLSearchParams()
    if (input.place) query.set('plaats', input.place)
    if (input.kvkNumber) query.set('kvkNummer', input.kvkNumber)
    if (input.establishmentNumber) query.set('vestigingsnummer', input.establishmentNumber)
    query.set('inclusiefInactieveRegistraties', String(Boolean(input.includeInactive)))
    query.set('pagina', String(input.page ?? 1))
    query.set('resultatenPerPagina', String(Math.min(100, input.resultsPerPage ?? 100)))
    for (const type of input.types ?? ['hoofdvestiging']) query.append('type', type)
    return this.request<KvkSearchResponse>('/v2/zoeken', query)
  }

  getBasisProfile(kvkNumber: string) {
    return this.request<KvkBasisProfile>(`/v1/basisprofielen/${encodeURIComponent(kvkNumber)}`)
  }

  getEstablishmentProfile(establishmentNumber: string) {
    return this.request<KvkEstablishmentProfile>(`/v1/vestigingsprofielen/${encodeURIComponent(establishmentNumber)}`)
  }

  listMutationSubscriptions() {
    return this.request<unknown>('/v1/abonnementen')
  }

  getMutationSubscription(subscriptionId: string, from?: string, until?: string) {
    const query = new URLSearchParams()
    if (from) query.set('vanaf', from)
    if (until) query.set('tot', until)
    return this.request<unknown>(`/v1/abonnementen/${encodeURIComponent(subscriptionId)}`, query)
  }

  getMutationSignal(subscriptionId: string, signalId: string) {
    return this.request<unknown>(`/v1/abonnementen/${encodeURIComponent(subscriptionId)}/signalen/${encodeURIComponent(signalId)}`)
  }
}
