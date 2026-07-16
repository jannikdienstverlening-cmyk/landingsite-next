import type { Metadata } from 'next'
import { DM_Mono, Syne } from 'next/font/google'
import './globals.css'

const syne=Syne({subsets:['latin'],weight:['400','700','800'],variable:'--font-syne',display:'swap'})
const dmMono=DM_Mono({subsets:['latin'],weight:['400','500'],variable:'--font-dm-mono',display:'swap'})

export const metadata:Metadata={
  title:{default:'Landingspagina laten maken in 48 uur | Landingsite.nl',template:'%s | Landingsite.nl'},
  description:'Laat een professionele landingspagina maken voor je campagne, product of dienst. Eerste versie binnen 48 uur, vaste prijs vanaf €299.',
  metadataBase:new URL('https://landingsite.nl'),
  alternates:{canonical:'/'},
  robots:{index:true,follow:true,googleBot:{index:true,follow:true}},
  openGraph:{type:'website',locale:'nl_NL',url:'https://landingsite.nl',siteName:'Landingsite.nl',title:'Van idee naar landingspagina in 48 uur',description:'Professionele landingspagina voor Nederlandse ondernemers. Eerste versie binnen 48 uur en een vaste prijs vanaf €299.'},
  twitter:{card:'summary_large_image',title:'Van idee naar landingspagina in 48 uur',description:'Een professionele eerste versie binnen 48 uur. Vanaf €299, met een werkend leadformulier.'},
  verification:{google:'iN4lNqCMdhok5XwzhIlYx3uX-XSAuYl08Iju7wdV76M'},
  keywords:['landingspagina laten maken','snelle landingspagina','campagnepagina','one pager laten maken','conversiepagina','leadpagina'],
}

export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="nl" className={`${syne.variable} ${dmMono.variable}`}><body>{children}</body></html>}
