import { KvkClient } from './client'
import type {
  DiscoveredCompany,
  DiscoveryFilters,
  KvkAddress,
  KvkBasisProfile,
  KvkEstablishmentProfile,
  KvkSearchResult,
} from './types'

function clean(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function monthsBetween(date: string, now: Date) {
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return null
  return (now.getFullYear() - parsed.getFullYear()) * 12 + now.getMonth() - parsed.getMonth()
}

function addressLine(address: KvkAddress | undefined) {
  if (!address) return null
  return [address.straatnaam, address.huisnummer, address.huisletter, address.toevoegingAdres]
    .filter((part) => part !== undefined && part !== null && String(part).trim())
    .join(' ') || null
}

function tradeNames(profile: KvkBasisProfile, establishment?: KvkEstablishmentProfile) {
  const entries = [...(profile.handelsnamen ?? []), ...(establishment?.handelsnamen ?? [])]
  return [...new Set(entries.map((entry) => clean(typeof entry === 'string' ? entry : entry.naam)).filter(Boolean) as string[])]
}

function matchesFilters(company: DiscoveredCompany, filters: DiscoveryFilters, now = new Date()) {
  if (!filters.includeInactive && !company.active) return false
  if (filters.postcodePrefixes?.length && !filters.postcodePrefixes.some((prefix) => company.postcode?.replace(/\s/g, '').startsWith(prefix.replace(/\s/g, '')))) return false
  if (filters.sbiPrefixes?.length && !company.sbiCodes.some(({ code }) => filters.sbiPrefixes?.some((prefix) => code.startsWith(prefix)))) return false
  if (filters.legalForms?.length && !filters.legalForms.some((form) => company.legalForm?.toLocaleLowerCase('nl-NL').includes(form.toLocaleLowerCase('nl-NL')))) return false
  if (filters.minimumEmployees !== undefined && (company.employeeCount ?? 0) < filters.minimumEmployees) return false
  if (filters.maximumEmployees !== undefined && (company.employeeCount ?? Number.POSITIVE_INFINITY) > filters.maximumEmployees) return false
  if ((filters.minimumAgeMonths !== undefined || filters.maximumAgeMonths !== undefined) && company.registrationDate) {
    const age = monthsBetween(company.registrationDate, now)
    if (age !== null && filters.minimumAgeMonths !== undefined && age < filters.minimumAgeMonths) return false
    if (age !== null && filters.maximumAgeMonths !== undefined && age > filters.maximumAgeMonths) return false
  }
  return true
}

export function standardizeKvkCompany(
  result: KvkSearchResult,
  profile: KvkBasisProfile,
  establishment?: KvkEstablishmentProfile,
): DiscoveredCompany {
  const address = establishment?.adressen?.find((entry) => entry.type?.toLowerCase().includes('bezoek') && !entry.afgeschermd)
    ?? establishment?.adressen?.find((entry) => !entry.afgeschermd)
    ?? result.adres
  const sbi = establishment?.sbiActiviteiten?.length ? establishment.sbiActiviteiten : profile.sbiActiviteiten ?? []
  const legalForm = clean(profile.eigenaar?.uitgebreideRechtsvorm)
    ?? clean(profile.eigenaar?.rechtsvorm)
    ?? clean(profile.rechtsvorm)
  const registrationDate = clean(establishment?.materieleRegistratie?.datumAanvang)
    ?? clean(profile.materieleRegistratie?.datumAanvang)
    ?? clean(profile.formeleRegistratiedatum)
  const establishmentNumber = clean(establishment?.vestigingsnummer) ?? clean(result.vestigingsnummer)
  return {
    dedupeKey: `${profile.kvkNummer}:${establishmentNumber ?? 'organisation'}`,
    source: 'KVK',
    sourceRecordId: `${profile.kvkNummer}:${establishmentNumber ?? 'organisation'}`,
    kvkNumber: profile.kvkNummer,
    establishmentNumber,
    companyName: clean(establishment?.eersteHandelsnaam) ?? clean(result.naam) ?? profile.naam,
    tradeNames: tradeNames(profile, establishment),
    place: clean(address?.plaats) ?? clean(result.adres?.plaats) ?? '',
    postcode: clean(address?.postcode) ?? clean(result.adres?.postcode),
    address: addressLine(address),
    legalForm,
    registrationDate,
    active: result.actief !== false && !establishment?.materieleRegistratie?.datumEinde,
    employeeCount: establishment?.totaalWerkzamePersonen ?? profile.totaalWerkzamePersonen ?? null,
    nonMailing: Boolean(profile.indNonMailing),
    sbiCodes: sbi.map((entry) => ({
      code: entry.sbiCode,
      description: entry.sbiOmschrijving,
      main: Boolean(entry.indHoofdactiviteit),
    })),
    websiteUrl: null,
    phone: null,
    email: null,
    urls: [],
    sourcePayload: {
      source: 'KVK Handelsregister API',
      products: ['Zoeken v2', 'Basisprofiel v1', ...(establishment ? ['Vestigingsprofiel v1'] : [])],
      retrievedAt: new Date().toISOString(),
    },
  }
}

export async function discoverKvkCompanies(filters: DiscoveryFilters, client = new KvkClient()) {
  const companies = new Map<string, DiscoveredCompany>()
  for (const place of filters.places) {
    const max = Math.max(1, Math.min(filters.maxResultsPerPlace ?? 100, 500))
    let page = 1
    while (companies.size < filters.places.length * max) {
      const response = await client.search({
        place,
        includeInactive: filters.includeInactive,
        page,
        resultsPerPage: Math.min(100, max),
        types: ['hoofdvestiging'],
      })
      const remaining = Math.max(0, max - (page - 1) * response.resultatenPerPagina)
      const results = response.resultaten.slice(0, remaining)
      for (const result of results) {
        const profile = await client.getBasisProfile(result.kvkNummer)
        const establishment = result.vestigingsnummer
          ? await client.getEstablishmentProfile(result.vestigingsnummer)
          : undefined
        const company = standardizeKvkCompany(result, profile, establishment)
        if (matchesFilters(company, filters)) companies.set(company.dedupeKey, company)
      }
      if (!response.resultaten.length || page * response.resultatenPerPagina >= Math.min(response.totaal, max)) break
      page += 1
    }
  }
  return [...companies.values()]
}

export async function discoverKvkCompanyByNumber(kvkNumber: string, client = new KvkClient()) {
  const response = await client.search({ kvkNumber, includeInactive: true, resultsPerPage: 10, types: ['hoofdvestiging'] })
  const result = response.resultaten.find((entry) => entry.kvkNummer === kvkNumber) ?? response.resultaten[0]
  if (!result) return null
  const [profile, establishment] = await Promise.all([
    client.getBasisProfile(result.kvkNummer),
    result.vestigingsnummer ? client.getEstablishmentProfile(result.vestigingsnummer) : Promise.resolve(undefined),
  ])
  return standardizeKvkCompany(result, profile, establishment)
}
