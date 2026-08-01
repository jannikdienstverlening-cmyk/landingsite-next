import { ImageResponse } from 'next/og'

export const alt = 'Landingsite.nl - landingspagina live zonder weken wachten'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative', overflow: 'hidden', background: '#071c16', color: '#fff', padding: '68px 78px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ position: 'absolute', width: 540, height: 540, borderRadius: 540, background: '#2069e8', opacity: .22, right: -170, top: -170, display: 'flex' }} />
      <div style={{ position: 'absolute', width: 420, height: 420, borderRadius: 420, background: '#47dda3', opacity: .18, left: -170, bottom: -210, display: 'flex' }} />
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%' }}>
        <div style={{ display: 'flex', fontSize: 30, fontWeight: 800 }}>
          landing<span style={{ color: '#47dda3' }}>site</span><span style={{ color: '#a8bbb3' }}>.nl</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: 20, textTransform: 'uppercase', letterSpacing: 4, color: '#47dda3', marginBottom: 20 }}>
            Landingspagina voor zzp en mkb
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', fontSize: 72, fontWeight: 800, lineHeight: .98, maxWidth: 930 }}>
            Een scherpe landingspagina, zonder weken wachten.
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 22, color: '#b3c7be' }}>
          <span>Eerste versie binnen 48 uur na betaling en complete intake</span>
          <span style={{ display: 'flex', padding: '13px 22px', borderRadius: 999, background: '#47dda3', color: '#071c16', fontWeight: 800 }}>Vanaf €299</span>
        </div>
      </div>
    </div>,
    size,
  )
}
