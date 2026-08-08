import { getSupabase } from './supabase'

const ASSET_PREFIX = 'asset://customer-assets/'
const assetPathPattern = /^[0-9a-f-]{36}\/[0-9a-f]{32}\.webp$/i

export function createCustomerAssetReference(path: string) {
  if (!assetPathPattern.test(path)) throw new Error('Ongeldig pad voor klantbestand.')
  return `${ASSET_PREFIX}${path}`
}

export function parseCustomerAssetReference(value: string | undefined) {
  if (!value?.startsWith(ASSET_PREFIX)) return null
  const path = value.slice(ASSET_PREFIX.length)
  return assetPathPattern.test(path) ? path : null
}

export async function downloadCustomerAsset(reference: string | undefined) {
  const path = parseCustomerAssetReference(reference)
  if (!path) return null
  const { data, error } = await getSupabase().storage.from('customer-assets').download(path)
  if (error || !data) throw new Error('Een veilig opgeslagen klantbestand kon niet worden geladen.')
  return Buffer.from(await data.arrayBuffer())
}
