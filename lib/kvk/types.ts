export type KvkAddress = {
  straatnaam?: string
  huisnummer?: number
  huisletter?: string
  toevoegingAdres?: string
  postcode?: string
  plaats?: string
  land?: string
}

export type KvkSearchResult = {
  kvkNummer: string
  vestigingsnummer?: string
  naam: string
  type: string
  actief: boolean
  adres?: KvkAddress
}

export type KvkSearchResponse = {
  pagina: number
  resultatenPerPagina: number
  totaal: number
  resultaten: KvkSearchResult[]
}

export type KvkSbiActivity = {
  sbiCode: string
  sbiOmschrijving: string
  indHoofdactiviteit?: boolean
}

export type KvkBasisProfile = {
  kvkNummer: string
  naam: string
  statutaireNaam?: string
  handelsnamen?: Array<{ naam?: string; volgorde?: number } | string>
  formeleRegistratiedatum?: string
  materieleRegistratie?: { datumAanvang?: string; datumEinde?: string }
  sbiActiviteiten?: KvkSbiActivity[]
  totaalWerkzamePersonen?: number
  indNonMailing?: boolean
  eigenaar?: { rechtsvorm?: string; uitgebreideRechtsvorm?: string }
  rechtsvorm?: string
}

export type KvkEstablishmentProfile = {
  vestigingsnummer: string
  kvkNummer: string
  eersteHandelsnaam?: string
  handelsnamen?: Array<{ naam?: string } | string>
  materieleRegistratie?: { datumAanvang?: string; datumEinde?: string }
  sbiActiviteiten?: KvkSbiActivity[]
  totaalWerkzamePersonen?: number
  adressen?: Array<KvkAddress & { type?: string; afgeschermd?: boolean }>
}

export type DiscoveryFilters = {
  places: string[]
  postcodePrefixes?: string[]
  sbiPrefixes?: string[]
  minimumAgeMonths?: number
  maximumAgeMonths?: number
  legalForms?: string[]
  includeInactive?: boolean
  minimumEmployees?: number
  maximumEmployees?: number
  maxResultsPerPlace?: number
}

export type DiscoveredCompany = {
  dedupeKey: string
  source: 'KVK' | 'OPENSTREETMAP'
  sourceRecordId: string
  kvkNumber: string | null
  establishmentNumber: string | null
  companyName: string
  tradeNames: string[]
  place: string
  postcode: string | null
  address: string | null
  legalForm: string | null
  registrationDate: string | null
  active: boolean
  employeeCount: number | null
  nonMailing: boolean
  sbiCodes: Array<{ code: string; description: string; main: boolean }>
  websiteUrl: string | null
  phone: string | null
  email: string | null
  urls: Array<{
    kind: 'WEBSITE' | 'INSTAGRAM' | 'FACEBOOK' | 'TIKTOK' | 'LINKEDIN'
    url: string
    confidence: number
    source: string
  }>
  sourcePayload: Record<string, unknown>
}

export type KvkMutationSignal = {
  eventId: string
  subscriptionId: string
  signalId: string
  signalType: string
  kvkNumber: string | null
  establishmentNumber: string | null
  registeredAt: string | null
  payload: Record<string, unknown>
}
