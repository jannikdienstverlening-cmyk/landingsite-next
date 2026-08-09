export const PHASE_ONE_PLACES = [
  'Veenendaal',
  'Ede',
  'Wageningen',
  'Rhenen',
  'Renswoude',
  'Scherpenzeel',
  'Leersum',
  'Amerongen',
  'Woudenberg',
  'Barneveld',
  'Lunteren',
] as const

export const PHASE_ONE_MARKET = {
  name: 'Veenendaal + 30 km',
  center: { latitude: 52.0263, longitude: 5.5544 },
  radiusKm: 30,
  places: [...PHASE_ONE_PLACES],
}

export const PHASE_ONE_PLACE_CENTERS: Record<(typeof PHASE_ONE_PLACES)[number], { latitude: number; longitude: number }> = {
  Veenendaal: { latitude: 52.0263, longitude: 5.5544 },
  Ede: { latitude: 52.0436, longitude: 5.6680 },
  Wageningen: { latitude: 51.9692, longitude: 5.6654 },
  Rhenen: { latitude: 51.9590, longitude: 5.5680 },
  Renswoude: { latitude: 52.0733, longitude: 5.5380 },
  Scherpenzeel: { latitude: 52.0800, longitude: 5.4890 },
  Leersum: { latitude: 52.0117, longitude: 5.4278 },
  Amerongen: { latitude: 52.0025, longitude: 5.4597 },
  Woudenberg: { latitude: 52.0808, longitude: 5.4167 },
  Barneveld: { latitude: 52.1400, longitude: 5.5847 },
  Lunteren: { latitude: 52.0850, longitude: 5.6220 },
}

export const EXCLUDED_SBI_PREFIXES = ['6201', '6202', '6209', '6311', '7311', '7410', 'OSM:shop:computer']

export function isExcludedDigitalBusiness(sbiCodes: Array<{ code: string }>) {
  return sbiCodes.some(({ code }) => EXCLUDED_SBI_PREFIXES.some((prefix) => code.startsWith(prefix)))
}
