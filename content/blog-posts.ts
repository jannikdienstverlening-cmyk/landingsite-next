export type BlogPostStatus = 'draft' | 'awaiting-review' | 'approved' | 'published' | 'archived'

export type BlogPostSection = {
  heading: string
  paragraphs: string[]
  bullets?: string[]
}

export type BlogPost = {
  slug: string
  status: BlogPostStatus
  title: string
  description: string
  excerpt: string
  category: string
  primaryKeyword: string
  secondaryKeywords: string[]
  searchIntent: string
  publishedAt: string
  updatedAt: string
  author: string
  reviewer: string
  readingTime: string
  sources: string[]
  sections: BlogPostSection[]
  relatedLinks: Array<{ label: string; href: string }>
}

const baseUrl = 'https://www.landingsite.nl'

export const blogPosts: BlogPost[] = [
  {
    slug: 'welke-informatie-hoort-op-een-dienstenpagina',
    status: 'published',
    title: 'Wat zet je op een pagina voor je dienst?',
    description: 'Bouw een duidelijke dienstenpagina met een afgebakend aanbod, herkenbare situaties, een concrete werkwijze, controleerbaar bewijs en een passende vervolgstap.',
    excerpt: 'Een dienstenpagina helpt een bezoeker bepalen wat je precies doet, wanneer de dienst past en wat een logische volgende stap is. Deze opbouw houdt de uitleg concreet.',
    category: 'Website-inhoud',
    primaryKeyword: 'welke informatie hoort op een dienstenpagina',
    secondaryKeywords: ['dienstenpagina schrijven', 'inhoud dienstenpagina', 'opbouw dienstenpagina'],
    searchIntent: 'Bepalen welke informatie een zakelijke dienstenpagina nodig heeft',
    publishedAt: '2026-08-21',
    updatedAt: '2026-08-21',
    author: 'Jannik',
    reviewer: 'Jannik',
    readingTime: '6 minuten',
    sources: [
      'https://developers.google.com/search/docs/fundamentals/creating-helpful-content',
      'https://www.w3.org/WAI/tutorials/page-structure/headings/',
      'https://www.w3.org/WAI/tips/writing/',
    ],
    sections: [
      {
        heading: 'Begin met de situatie die je oplost',
        paragraphs: [
          'Open niet met een lange beschrijving van je bedrijf. Benoem eerst de dienst en de situatie waarin iemand die nodig kan hebben. Zo kan een bezoeker bepalen of de pagina over de eigen vraag gaat.',
          'Gebruik de woorden die klanten zelf gebruiken. “Hulp bij een arbeidsconflict” is bijvoorbeeld concreter dan “strategische ondersteuning voor mens en organisatie”. Leg vaktaal uit wanneer je die toch nodig hebt.',
        ],
      },
      {
        heading: 'Baken af wat wel en niet bij de dienst hoort',
        paragraphs: [
          'Beschrijf welke werkzaamheden binnen de dienst vallen en welk resultaat je oplevert, zonder een uitkomst te garanderen. Denk aan een advies, ontwerp, rapport, uitvoering of overdracht. Noem ook relevante grenzen, zodat een bezoeker geen andere dienstverlening verwacht dan je aanbiedt.',
          'Heb je meerdere diensten met een wezenlijk andere vraag of aanpak? Geef iedere dienst dan een eigen uitleg. Maak geen bijna gelijke pagina\'s waarin alleen een doelgroep of plaatsnaam verandert.',
        ],
        bullets: [
          'Welke concrete vraag pakt deze dienst aan?',
          'Welke werkzaamheden voer je uit?',
          'Wat ontvangt de klant aan het einde?',
          'Wat valt buiten deze dienst?',
        ],
      },
      {
        heading: 'Maak de werkwijze voorspelbaar',
        paragraphs: [
          'Zet de belangrijkste stappen in de volgorde waarin de klant ze ervaart. Benoem wat je eerst nodig hebt, wat jij daarna doet en wanneer de klant iets moet beoordelen of aanleveren.',
          'Schrijf alleen termijnen op die je kunt onderbouwen en leg voorwaarden direct uit. Een werkwijze van drie heldere stappen is nuttiger dan een precieze planning die niet voor iedere opdracht geldt.',
        ],
      },
      {
        heading: 'Beantwoord vragen die de keuze bepalen',
        paragraphs: [
          'Inventariseer welke informatie iemand nodig heeft voordat contact logisch voelt. Dat kan gaan over geschiktheid, voorbereiding, samenwerking, oplevering of nazorg. Geef het antwoord op de pagina in plaats van alleen de vraag in een lijst te herhalen.',
          'Google adviseert content te maken die een bedoeld publiek daadwerkelijk helpt en na het lezen genoeg informatie geeft om het doel te bereiken. Kies vragen daarom op basis van echte dienstverlening en niet alleen omdat een zoekterm vaak wordt gebruikt.',
        ],
      },
      {
        heading: 'Gebruik alleen bewijs dat controleerbaar is',
        paragraphs: [
          'Ondersteun je uitleg met echt werk, een relevante certificering, aantoonbare ervaring of een klantreactie waarvoor publicatietoestemming bestaat. Vermeld genoeg context om duidelijk te maken wat het bewijs laat zien.',
          'Heb je nog geen passend bewijs, laat het onderdeel dan weg. Een concrete uitleg van je proces is geloofwaardiger dan sterren, aantallen of resultaten zonder herleidbare bron.',
        ],
      },
      {
        heading: 'Geef iedere sectie een duidelijke kop',
        paragraphs: [
          'Verdeel langere uitleg in onderdelen met beschrijvende tussenkoppen. W3C legt uit dat koppen de inhoudsstructuur communiceren en door hulptechnologie kunnen worden gebruikt voor navigatie. Gebruik daarom echte kopniveaus in een logische volgorde, niet alleen vetgedrukte tekst.',
          'Maak ook link- en knopteksten betekenisvol. W3C adviseert dat de tekst het doel van de link beschrijft. “Vraag een kennismaking aan” vertelt meer dan “Klik hier”.',
        ],
      },
      {
        heading: 'Sluit af met een passende volgende stap',
        paragraphs: [
          'Kies een actie die past bij de hoeveelheid informatie die een bezoeker nu heeft. Bij een afgebakende dienst kan dat een aanvraag zijn. Bij maatwerk past een korte kennismaking of gerichte vraag vaak beter.',
          'Controleer de volledige pagina tenslotte op mobiel en desktop. Lees alleen de koppen om te zien of de hoofdlijn duidelijk blijft en test iedere link, knop en formulierstap zelf.',
        ],
        bullets: [
          'De titel benoemt de dienst of klantvraag.',
          'Omvang en grenzen van de dienst zijn concreet.',
          'De werkwijze staat in een logische volgorde.',
          'Claims en bewijs zijn herleidbaar.',
          'Koppen en links beschrijven hun doel.',
          'De vervolgstap past bij de dienst.',
        ],
      },
    ],
    relatedLinks: [
      { label: 'Lees hoeveel pagina\'s je zakelijke website nodig heeft', href: '/blog/hoeveel-paginas-heeft-een-zakelijke-website-nodig' },
      { label: 'Bekijk een websitepakket voor zzp', href: '/website-laten-maken-zzp' },
    ],
  },
  {
    slug: 'welke-velden-heeft-een-contactformulier-nodig',
    status: 'published',
    title: 'Welke velden heeft een contactformulier nodig?',
    description: 'Kies welke velden je contactformulier echt nodig heeft en maak duidelijk wat verplicht is, waarom je de informatie vraagt en wat er na verzenden gebeurt.',
    excerpt: 'Een bruikbaar contactformulier vraagt genoeg informatie om te kunnen reageren, maar niet meer dan daarvoor nodig is. Met deze aanpak kies je ieder veld bewust.',
    category: 'Formulieren',
    primaryKeyword: 'welke velden heeft een contactformulier nodig',
    secondaryKeywords: ['velden contactformulier', 'contactformulier maken', 'contactformulier website inhoud'],
    searchIntent: 'Bepalen welke velden een zakelijk contactformulier nodig heeft',
    publishedAt: '2026-08-14',
    updatedAt: '2026-08-14',
    author: 'Jannik',
    reviewer: 'Jannik',
    readingTime: '5 minuten',
    sources: [
      'https://eur-lex.europa.eu/legal-content/NL/TXT/?uri=CELEX:32016R0679',
      'https://www.w3.org/WAI/tutorials/forms/',
      'https://www.w3.org/WAI/tutorials/forms/labels/',
      'https://www.w3.org/WAI/tutorials/forms/validation/',
      'app/verwerkersovereenkomst/page.tsx',
    ],
    sections: [
      {
        heading: 'Begin bij wat je na de aanvraag moet doen',
        paragraphs: [
          'Schrijf eerst op welke informatie je nodig hebt om de vraag te begrijpen en via het gewenste kanaal te beantwoorden. Maak pas daarna het formulier. Zo krijgt ieder veld een duidelijke taak.',
          'Voor een algemene contactvraag zijn een naam, een e-mailadres en een open vraag vaak een bruikbare basis. Een telefoonnummer, bedrijfsnaam of voorkeursdatum voeg je alleen toe wanneer je die informatie in deze eerste stap werkelijk gebruikt.',
        ],
      },
      {
        heading: 'Vraag niet alvast alles voor een mogelijke opdracht',
        paragraphs: [
          'Artikel 5 van de Algemene verordening gegevensbescherming noemt gegevensminimalisatie als beginsel: persoonsgegevens moeten toereikend, relevant en beperkt zijn tot wat noodzakelijk is voor het doel van de verwerking.',
          'Een eerste contactformulier hoeft daarom niet automatisch alle gegevens voor een offerte, overeenkomst of factuur te verzamelen. Informatie die pas later nodig is, kun je ook later en in de juiste context vragen.',
        ],
        bullets: [
          'Vraag geen adres wanneer je alleen per e-mail reageert.',
          'Maak een telefoonnummer optioneel als bellen geen noodzakelijke vervolgstap is.',
          'Vraag geen bijzondere persoonsgegevens, BSN, medische gegevens of betaalgegevens via een standaardformulier.',
          'Leg kort uit waarvoor je de ingevulde gegevens gebruikt.',
        ],
      },
      {
        heading: 'Maak verplicht en optioneel zichtbaar',
        paragraphs: [
          'Een bezoeker moet voor het invullen kunnen zien welke velden verplicht zijn. Zet daarom bijvoorbeeld “verplicht” in het label of leg boven het formulier uit hoe verplichte velden zijn gemarkeerd.',
          'Gebruik bij ieder invoerveld een zichtbaar, beschrijvend label. W3C adviseert om labels technisch aan de juiste velden te koppelen, zodat ook hulptechnologie de relatie kan herkennen. Een placeholder is geen volwaardige vervanging voor zo\'n label.',
        ],
      },
      {
        heading: 'Geef ruimte voor de echte vraag',
        paragraphs: [
          'Keuzevelden kunnen helpen om aanvragen te ordenen, maar dwingen niet iedere vraag in vooraf bedachte categorieën. Voeg daarom een open tekstveld toe waarin iemand de situatie of vraag in eigen woorden kan beschrijven.',
          'Maak de instructie concreet. “Waar kunnen we mee helpen?” geeft meer richting dan “Bericht”. Vraag alleen om details die nodig zijn om een eerste inhoudelijke reactie te geven.',
        ],
      },
      {
        heading: 'Vertel wat er na verzenden gebeurt',
        paragraphs: [
          'Een duidelijke verzendknop beschrijft de actie, bijvoorbeeld “Stuur mijn vraag”. Laat na verzending zichtbaar weten of de aanvraag is ontvangen. Als iets ontbreekt of ongeldig is, benoem dan bij het betreffende veld wat de bezoeker moet aanpassen.',
          'W3C adviseert invoer te valideren en gebruikers begrijpelijke feedback te geven. Controleer de werking daarom niet alleen in de code, maar verstuur zelf een test op mobiel en desktop en controleer of de aanvraag op de afgesproken plek aankomt.',
        ],
      },
      {
        heading: 'Gebruik deze korte controlelijst',
        paragraphs: [
          'Loop het formulier veld voor veld na. Kun je niet uitleggen waarom je een gegeven nu nodig hebt, laat het dan weg of maak het optioneel.',
        ],
        bullets: [
          'Ieder veld ondersteunt de eerste reactie op de aanvraag.',
          'Verplichte en optionele velden zijn herkenbaar.',
          'Ieder veld heeft een zichtbaar en technisch gekoppeld label.',
          'De bezoeker weet waarvoor de gegevens worden gebruikt.',
          'Fouten en een geslaagde verzending worden duidelijk gemeld.',
          'De volledige route is getest op mobiel en desktop.',
        ],
      },
    ],
    relatedLinks: [
      { label: 'Lees hoe Landingsite.nl met gegevens omgaat', href: '/privacybeleid' },
      { label: 'Bekijk een websitepakket voor zzp', href: '/website-laten-maken-zzp' },
    ],
  },
  {
    slug: 'hoeveel-paginas-heeft-een-zakelijke-website-nodig',
    status: 'published',
    title: 'Hoeveel pagina\'s heeft een zakelijke website nodig?',
    description: 'Bepaal hoeveel pagina\'s je zakelijke website nodig heeft op basis van je aanbod, bezoekersvragen en gewenste contactroute.',
    excerpt: 'Een goede website heeft niet zoveel mogelijk pagina\'s nodig. De juiste omvang hangt af van je aanbod, het bewijs dat bezoekers zoeken en de route naar contact.',
    category: 'Website-opbouw',
    primaryKeyword: 'hoeveel pagina\'s heeft een zakelijke website nodig',
    secondaryKeywords: ['aantal pagina\'s website', 'landingspagina of website', 'opbouw zakelijke website'],
    searchIntent: 'Bepalen hoeveel pagina\'s een zakelijke website nodig heeft',
    publishedAt: '2026-08-07',
    updatedAt: '2026-08-07',
    author: 'Jannik',
    reviewer: 'Jannik',
    readingTime: '5 minuten',
    sources: ['config/commercial.ts', 'content/site.ts', 'data/portfolio.ts'],
    sections: [
      {
        heading: 'Begin bij het aantal beslissingen',
        paragraphs: [
          'Het aantal pagina\'s is geen kwaliteitsmaatstaf. Een bezoeker heeft vooral genoeg informatie nodig om te begrijpen wat je aanbiedt, of het bij de situatie past en hoe contact opnemen werkt.',
          'Breng daarom eerst de belangrijkste vragen en beslissingen in kaart. Informatie die bij dezelfde beslissing hoort, kan vaak op een pagina blijven. Onderwerpen met een eigen zoekvraag of een duidelijk andere doelgroep verdienen eerder een aparte pagina.',
        ],
      },
      {
        heading: 'Wanneer een landingspagina genoeg is',
        paragraphs: [
          'Een landingspagina past goed bij een duidelijk afgebakende dienst, campagne of actie. De bezoeker volgt dan een korte route van aanbod en uitleg naar bewijs, veelgestelde vragen en een aanvraag.',
          'Dat werkt vooral wanneer je doelgroep, aanbod en primaire actie hetzelfde blijven. Je voorkomt zo dat bezoekers tussen pagina\'s moeten zoeken voordat ze kunnen beslissen.',
        ],
        bullets: [
          'Je verkoopt een duidelijk afgebakende dienst of actie.',
          'De belangrijkste bezoekers hebben vergelijkbare vragen.',
          'Er is een primaire aanvraag- of contactroute.',
          'Je hebt geen uitgebreide kennisbank of afzonderlijke dienstenstructuur nodig.',
        ],
      },
      {
        heading: 'Wanneer meerdere pagina\'s duidelijker zijn',
        paragraphs: [
          'Meerdere pagina\'s worden nuttig wanneer diensten inhoudelijk verschillen, bezoekers andere informatie nodig hebben of onderwerpen ieder een eigen zoekintentie hebben. Een aparte diensten-, werkwijze- of contactpagina kan de inhoud dan beter ordenen.',
          'Maak alleen een pagina wanneer die zelfstandig waarde toevoegt. Een dunne pagina met bijna dezelfde tekst als een andere pagina helpt de bezoeker niet en maakt het beheer onnodig ingewikkeld.',
        ],
      },
      {
        heading: 'Een praktische basis voor een kleine bedrijfswebsite',
        paragraphs: [
          'Voor veel kleine dienstverleners is een compacte structuur voldoende. Denk aan een homepage, een of meer inhoudelijk verschillende dienstenpagina\'s, een pagina met werk of bewijs en een contactpagina.',
          'Dat is geen vaste regel. Een over-pagina is bijvoorbeeld alleen zinvol wanneer de persoon, ervaring of werkwijze belangrijk is voor de keuze van de klant. Combineer hem anders met de homepage.',
        ],
      },
      {
        heading: 'Kies de kleinste structuur die volledig is',
        paragraphs: [
          'Schrijf eerst op welke vragen een bezoeker moet kunnen beantwoorden. Groepeer die informatie vervolgens per onderwerp en controleer of iedere pagina een duidelijke taak heeft.',
          'Je kunt later altijd uitbreiden. Een overzichtelijke eerste versie met complete informatie is nuttiger dan een grote website met halfgevulde pagina\'s.',
        ],
        bullets: [
          'Wat bied je aan en voor wie?',
          'Welke informatie neemt twijfel weg?',
          'Welk bewijs mag je aantoonbaar gebruiken?',
          'Welke actie wil je per pagina uitlokken?',
          'Heeft ieder onderwerp echt een eigen pagina nodig?',
        ],
      },
    ],
    relatedLinks: [
      { label: 'Vergelijk de websitepakketten', href: '/#pakketten' },
      { label: 'Bekijk websites die al live staan', href: '/werk' },
    ],
  },
  {
    slug: 'wat-moet-er-bovenaan-je-website-staan',
    status: 'published',
    title: 'Wat moet er bovenaan je website staan?',
    description: 'Een praktische opbouw voor de bovenkant van een zakelijke website: aanbod, doelgroep, bewijs en een duidelijke volgende stap.',
    excerpt: 'De bovenkant van je website hoeft niet alles te vertellen. Hij moet vooral de juiste bezoeker snel laten begrijpen wat je aanbiedt en wat de volgende stap is.',
    category: 'Website-inhoud',
    primaryKeyword: 'wat moet er bovenaan een website staan',
    secondaryKeywords: ['inhoud bovenkant website', 'goede website hero', 'homepage tekst opbouw'],
    searchIntent: 'Begrijpen welke informatie bovenaan een zakelijke website hoort',
    publishedAt: '2026-08-11',
    updatedAt: '2026-08-11',
    author: 'Jannik',
    reviewer: 'Jannik',
    readingTime: '5 minuten',
    sources: ['content/site.ts', 'data/portfolio.ts', 'config/verified-claims.ts'],
    sections: [
      {
        heading: 'Begin met wat je daadwerkelijk aanbiedt',
        paragraphs: [
          'Een bezoeker moet niet eerst je bedrijfsverhaal lezen om te ontdekken wat je verkoopt. Zet je dienst, product of belangrijkste aanbod daarom in de hoofdkop of direct eronder.',
          'Een concrete zin werkt beter dan een brede belofte. Schrijf bijvoorbeeld dat je arbeidsrechtelijk advies geeft aan werkgevers, in plaats van alleen te zeggen dat je organisaties vooruithelpt.',
        ],
      },
      {
        heading: 'Maak duidelijk voor wie het bedoeld is',
        paragraphs: [
          'Noem de doelgroep wanneer je aanbod niet voor iedereen is. Dat helpt de juiste bezoeker zichzelf herkennen en voorkomt dat de tekst algemeen wordt.',
          'Je hoeft daarbij niet iedere mogelijke klant op te sommen. Kies de groep waarop je website en aanbod werkelijk zijn gericht.',
        ],
      },
      {
        heading: 'Kies één logische volgende stap',
        paragraphs: [
          'De belangrijkste knop bovenaan moet aansluiten op wat een bezoeker op dat moment kan beslissen. Voor een adviseur kan dat een kennismaking zijn. Voor een concrete dienst kan het een aanvraag of pakketkeuze zijn.',
          'Zet concurrerende acties niet allemaal even groot naast elkaar. Eén primaire actie geeft richting; een tweede, rustige link kan bezoekers helpen die eerst bewijs of voorbeelden willen zien.',
        ],
      },
      {
        heading: 'Plaats bewijs dicht bij de belofte',
        paragraphs: [
          'Een project, keurmerk, werkwijze of echte klantreview kan twijfel verminderen, maar alleen wanneer het bewijs controleerbaar en relevant is. Gebruik geen cijfers of sterren die je niet kunt onderbouwen.',
          'Heb je nog weinig reviews? Laat dan liever echt werk zien. Een live project zegt meer dan een algemene claim over kwaliteit.',
        ],
      },
      {
        heading: 'Controleer de mobiele versie als eerste',
        paragraphs: [
          'Op een klein scherm is weinig ruimte voor omwegen. Controleer daarom of kop, uitleg en primaire knop zonder onhandige afbrekingen zichtbaar blijven.',
        ],
        bullets: [
          'De kop benoemt het aanbod.',
          'De intro noemt de doelgroep en context.',
          'De primaire knop beschrijft een duidelijke actie.',
          'Bewijs is echt en leesbaar.',
          'De tekst blijft rustig op een mobiel scherm.',
        ],
      },
    ],
    relatedLinks: [
      { label: 'Bekijk live websitevoorbeelden', href: '/werk' },
      { label: 'Bekijk de websitepakketten', href: '/#pakketten' },
    ],
  },
]

function isPublicStatus(status: BlogPostStatus) {
  return status === 'approved' || status === 'published'
}

export function publishedBlogPosts(now = new Date()) {
  const today = now.toISOString().slice(0, 10)
  return blogPosts
    .filter((post) => isPublicStatus(post.status) && post.publishedAt <= today)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
}

export function publishedBlogPost(slug: string, now = new Date()) {
  return publishedBlogPosts(now).find((post) => post.slug === slug)
}

export function blogPostCanonical(post: BlogPost) {
  return `${baseUrl}/blog/${post.slug}`
}

export function formatBlogDate(value: string) {
  return new Intl.DateTimeFormat('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Amsterdam',
  }).format(new Date(`${value}T12:00:00+02:00`))
}
