import { ImageResponse } from 'next/og'
import { commercialConfig } from '@/config/commercial'

export const alt = 'Landingsite.nl - websites die aanvragen opleveren'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative', overflow: 'hidden', background: '#0a0b0d', color: '#fffdf8', padding: '68px 78px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ position: 'absolute', width: 16, height: '100%', background: '#245cff', left: 0, top: 0, display: 'flex' }} />
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%' }}>
        <div style={{ display: 'flex', fontSize: 30, fontWeight: 800 }}>
          landingsite<span style={{ color: '#ff6a2a' }}>.</span>nl
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: 20, textTransform: 'uppercase', letterSpacing: 4, color: '#47dda3', marginBottom: 20 }}>
            Websites voor Nederlandse ondernemers
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', fontSize: 72, fontWeight: 800, lineHeight: .98, maxWidth: 930 }}>
            Je website moet aanvragen opleveren.
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 22, color: '#b3c7be' }}>
          <span>Eerste versie binnen 48 uur na betaling en complete intake</span>
          <span style={{ display: 'flex', padding: '13px 22px', background: '#245cff', color: '#fff', fontWeight: 800 }}>Bouw €{commercialConfig.packages.starter.oneTimePrice} · beheer €{commercialConfig.management.monthlyPrice} p/m</span>
        </div>
      </div>
    </div>,
    size,
  )
}
