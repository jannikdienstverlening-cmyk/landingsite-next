import { BUSINESS } from '@/lib/business'

export type SocialFeedItem = {
  platform: 'TikTok' | 'Instagram' | 'LinkedIn'
  kind: 'post' | 'profile'
  title: string
  description: string
  url: string
  image?: string
  imageAlt?: string
}

export const socialFeedItems: SocialFeedItem[] = [
  {
    platform: 'TikTok',
    kind: 'post',
    title: '4 knoppen. Geen duidelijke volgende stap.',
    description: 'Waarom één hoofddoel sterker werkt dan vier concurrerende knoppen op dezelfde pagina.',
    url: 'https://www.tiktok.com/@landingsite.nl/video/7671942365669756162',
    image: '/images/social/tiktok-cta-audit.jpg',
    imageAlt: 'Cover van de nieuwste TikTok-video van Landingsite.nl over een duidelijke hoofdactie',
  },
  {
    platform: 'Instagram',
    kind: 'profile',
    title: 'Projectbeelden en korte websitechecks.',
    description: 'Volg @landingsite.nl voor nieuw werk en praktische verbeterpunten voor websites.',
    url: BUSINESS.social.instagram,
  },
  {
    platform: 'LinkedIn',
    kind: 'profile',
    title: 'Cases en updates voor ondernemers.',
    description: 'Volg Landingsite.nl voor uitleg over aanpak, oplevering en websitebeheer.',
    url: BUSINESS.social.linkedin,
  },
]
