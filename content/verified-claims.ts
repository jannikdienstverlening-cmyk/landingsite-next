export const verifiedClaims = {
  firstVersionHours: {
    value: 48,
    condition: 'Na bevestigde betaling en ontvangst van een complete, bruikbare intake.',
    source: 'Actieve commerciele configuratie en algemene voorwaarden.',
  },
  portfolio: {
    projects: ['Ontwikkelbegeleiding.nl', 'WIA Management', 'AIbouwers.nl'],
    source: 'Publiek bereikbare websites en lokale screenshots.',
  },
  commercial: {
    source: 'config/commercial.ts',
  },
} as const

