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
    slug: 'hoe-kies-je-een-goede-url-voor-een-webpagina',
    status: 'published',
    title: 'Hoe kies je een goede URL voor een webpagina?',
    description: 'Kies een korte, beschrijvende en stabiele URL voor iedere zakelijke webpagina, met leesbare woorden, koppeltekens en één vaste voorkeursversie.',
    excerpt: 'Een goede URL maakt duidelijk welke pagina iemand opent en blijft bruikbaar wanneer je de inhoud bijwerkt. Met deze stappen kies je per pagina een leesbaar en stabiel adres.',
    category: 'SEO',
    primaryKeyword: 'goede URL voor webpagina',
    secondaryKeywords: ['URL structuur website', 'SEO-vriendelijke URL', 'URL naam kiezen'],
    searchIntent: 'Een duidelijke, stabiele URL voor een zakelijke webpagina kiezen',
    publishedAt: '2026-10-09',
    updatedAt: '2026-10-09',
    author: 'Jannik',
    reviewer: 'Jannik',
    readingTime: '6 minuten',
    sources: [
      'https://developers.google.com/search/docs/crawling-indexing/url-structure',
      'https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls',
      'https://developers.google.com/search/docs/crawling-indexing/links-crawlable',
    ],
    sections: [
      {
        heading: 'Begin met het onderwerp van de pagina',
        paragraphs: [
          'Bepaal eerst welke ene taak de pagina heeft. De URL hoeft niet de volledige paginatitel te herhalen, maar moet wel genoeg zeggen om het onderwerp te herkennen. Voor een pagina over onderhoud van een zakelijke website is “/website-onderhoud” bijvoorbeeld duidelijker dan “/dienst-3” of “/pagina?id=27”.',
          'Google adviseert een eenvoudige, logisch opgebouwde URL met leesbare woorden in de taal van je doelgroep. Kies daarom gewone Nederlandse woorden die passen bij de inhoud. Voeg geen losse zoekwoordvarianten toe die de URL langer maken zonder het onderwerp preciezer te beschrijven.',
        ],
      },
      {
        heading: 'Houd het pad kort en beschrijvend',
        paragraphs: [
          'Schrap woorden die niets toevoegen aan de herkenning van de pagina. “/diensten/website-onderhoud” geeft een duidelijke plaats en onderwerp aan. Een pad als “/onze-diensten/alles-over-professioneel-website-onderhoud-voor-bedrijven” is moeilijker te lezen en later lastiger consequent te gebruiken.',
          'Kort betekent niet dat iedere URL uit één woord moet bestaan. Laat de benodigde context staan wanneer twee pagina’s anders hetzelfde adres zouden krijgen. Gebruik bijvoorbeeld “/website-onderhoud” en “/webshop-onderhoud” als het echt om twee afzonderlijke diensten gaat.',
        ],
      },
      {
        heading: 'Scheid woorden met koppeltekens',
        paragraphs: [
          'Gebruik een koppelteken tussen woorden: “/online-afspraak-maken”. Google raadt koppeltekens aan in plaats van underscores en adviseert om woorden niet zonder scheiding aan elkaar te plakken. Zo blijven de afzonderlijke begrippen in het adres herkenbaar.',
          'Kies daarnaast één vaste schrijfwijze. URL-paden zijn hoofdlettergevoelig voor Google, waardoor “/Contact” en “/contact” als verschillende adressen kunnen worden behandeld. Kleine letters voorkomen onnodige varianten en zijn eenvoudig consequent toe te passen in menu’s, knoppen en andere interne links.',
        ],
      },
      {
        heading: 'Gebruik zo min mogelijk parameters',
        paragraphs: [
          'Een parameter staat meestal na een vraagteken, zoals “?sortering=nieuw”. Voor filters en technische functies kan dat nuttig zijn, maar een gewone informatie- of dienstenpagina heeft meestal een vast, leesbaar pad nodig. Google adviseert onnodige parameters weg te laten, vooral wanneer ze niets aan de inhoud veranderen.',
          'Voorkom dat trackingcodes, sessie-ID’s of verschillende sorteervolgordes blijvend als aparte paginaversies worden gebruikt. Veel URL’s met dezelfde of bijna dezelfde inhoud maken het beheer ingewikkelder en kunnen crawlers tijd laten besteden aan varianten die geen eigen pagina hoeven te zijn.',
        ],
      },
      {
        heading: 'Kies één voorkeurs-URL per pagina',
        paragraphs: [
          'Controleer of dezelfde inhoud via meerdere adressen bereikbaar is, bijvoorbeeld met en zonder een parameter of via twee oude paden. Wijs dan één versie aan als voorkeurs-URL. Link binnen je website steeds naar die versie en neem diezelfde URL op in de sitemap.',
          'Voor dubbele of sterk vergelijkbare pagina’s beschrijft Google redirects en een rel="canonical"-verwijzing als sterke signalen voor de voorkeursversie. De sitemap is een zwakker signaal. Gebruik deze middelen consequent en laat ze niet naar verschillende URL’s wijzen. Een canonical is bovendien geen oplossing voor twee pagina’s die eigenlijk ieder een eigen onderwerp moeten hebben.',
        ],
      },
      {
        heading: 'Wijzig een bestaande URL alleen met een reden',
        paragraphs: [
          'Een URL hoeft niet mee te veranderen bij iedere aanpassing aan de titel of tekst. Kies een adres dat het blijvende onderwerp beschrijft en laat jaartallen, tijdelijke campagnes en wisselende slogans weg als ze geen vast onderdeel van de pagina zijn.',
          'Moet een bestaand adres toch veranderen, zorg dan dat het oude adres permanent naar de passende nieuwe pagina verwijst. Werk ook je interne links en sitemap bij. Controleer na de wijziging of je website niet tegelijk naar het oude en het nieuwe adres blijft linken.',
        ],
      },
      {
        heading: 'Controleer de URL voordat je publiceert',
        paragraphs: [
          'Lees het volledige adres alsof je het voor het eerst in een e-mail, zoekresultaat of browser ziet. Het onderwerp moet herkenbaar zijn zonder dat je de pagina al hebt geopend. Controleer daarna de technische verwerking en de verwijzingen binnen je site.',
        ],
        bullets: [
          'De URL beschrijft één duidelijk paginaonderwerp.',
          'Het pad gebruikt gewone Nederlandse woorden.',
          'Overbodige woorden en parameters zijn weggelaten.',
          'Woorden zijn met koppeltekens gescheiden.',
          'Het pad gebruikt consequent kleine letters.',
          'Interne links verwijzen naar één voorkeursversie.',
          'De canonical en sitemap noemen dezelfde voorkeurs-URL.',
          'Een eventueel oud adres verwijst naar de passende nieuwe pagina.',
        ],
      },
    ],
    relatedLinks: [
      { label: 'Lees hoe je een paginatitel en metabeschrijving schrijft', href: '/blog/hoe-schrijf-je-een-goede-paginatitel-en-metabeschrijving' },
      { label: 'Lees hoe je duidelijke link- en knopteksten schrijft', href: '/blog/hoe-schrijf-je-duidelijke-link-en-knopteksten' },
    ],
  },
  {
    slug: 'hoe-maak-je-een-logische-koppenstructuur',
    status: 'published',
    title: 'Hoe gebruik je koppen op een webpagina?',
    description: 'Bouw een zakelijke webpagina op met een duidelijke H1, logische H2- en H3-koppen en semantische HTML die de inhoud begrijpelijk en navigeerbaar maakt.',
    excerpt: 'Een goede koppenstructuur laat in één oogopslag zien waar een pagina over gaat en hoe de onderdelen bij elkaar horen. Met deze aanpak zet je H1, H2 en H3 logisch in.',
    category: 'Toegankelijkheid',
    primaryKeyword: 'koppenstructuur website',
    secondaryKeywords: ['H1 H2 H3 website', 'koppen website gebruiken', 'heading structuur website'],
    searchIntent: 'Een logische en toegankelijke koppenstructuur voor een zakelijke webpagina maken',
    publishedAt: '2026-10-02',
    updatedAt: '2026-10-02',
    author: 'Jannik',
    reviewer: 'Jannik',
    readingTime: '6 minuten',
    sources: [
      'https://www.w3.org/WAI/tutorials/page-structure/headings/',
      'https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html',
      'https://www.w3.org/WAI/WCAG22/Techniques/general/G141.html',
      'https://www.w3.org/WAI/tips/writing/',
    ],
    sections: [
      {
        heading: 'Begin met de hoofdtaak van de pagina',
        paragraphs: [
          'Schrijf eerst in één zin op waarvoor de pagina bestaat. Die ene hoofdtaak bepaalt de hoofdkop. Een dienstenpagina kan bijvoorbeeld beginnen met “Arbeidsrechtelijk advies voor werkgevers”, terwijl een contactpagina genoeg kan hebben aan “Contact opnemen met Bedrijfsnaam”.',
          'Gebruik als praktische basis één H1 voor het hoofdonderwerp van de pagina. Dat is een heldere redactionele afspraak, geen algemene regel dat HTML of WCAG nooit meer dan één H1 toestaat. Het belangrijkste is dat de hoofdkop de pagina herkenbaar samenvat en dat de rest van de koppen daar logisch onder valt.',
        ],
      },
      {
        heading: 'Gebruik H2 voor de hoofdonderdelen',
        paragraphs: [
          'Verdeel de inhoud daarna in een klein aantal hoofdonderdelen. Ieder zelfstandig onderdeel krijgt een H2. Op een dienstenpagina kunnen dat bijvoorbeeld “Voor wie is de dienst?”, “Wat krijg je?” en “Hoe werkt de aanvraag?” zijn.',
          'W3C adviseert korte koppen die de bijbehorende sectie beschrijven. Schrijf daarom niet alleen “Meer informatie” of “Lees verder”, maar benoem wat iemand in het volgende stuk kan vinden. De koppen vormen zo samen een beknopte inhoudsopgave van de pagina.',
        ],
      },
      {
        heading: 'Voeg H3 alleen toe voor een onderdeel van een H2',
        paragraphs: [
          'Gebruik een H3 wanneer een H2-sectie echt uit meerdere herkenbare subonderdelen bestaat. Onder de H2 “Hoe werkt de aanvraag?” kunnen bijvoorbeeld de H3-koppen “Kennismaking”, “Voorstel” en “Start” staan. Komt er maar één kort tekstblok onder een H2, dan is een extra H3 meestal niet nodig.',
          'Laat de niveaus de inhoudelijke relatie volgen. W3C beschrijft een logische nesting waarbij een H1 wordt gevolgd door H2, en een onderdeel binnen een H2 door H3. Sla dus niet van H2 naar H4 omdat de H4 toevallig kleiner is opgemaakt; pas de vormgeving aan zonder de inhoudelijke hiërarchie te veranderen.',
        ],
      },
      {
        heading: 'Gebruik koppen niet als vormgevingstruc',
        paragraphs: [
          'Een grote, vetgedrukte regel is niet automatisch een kop. Markeer tekst die als sectiekop werkt met het passende HTML-headingelement. Anders is de visuele structuur niet vanzelf beschikbaar voor software die de pagina anders presenteert, zoals een schermlezer.',
          'Het omgekeerde geldt ook: maak geen gewone slogan, prijs of losse call-to-action tot H2 alleen om grotere letters te krijgen. Gebruik CSS voor het uiterlijk en headingelementen voor de structuur. Zo blijven opmaak en betekenis twee afzonderlijke keuzes.',
        ],
      },
      {
        heading: 'Schrijf koppen die ook los duidelijk zijn',
        paragraphs: [
          'Bezoekers lezen een pagina niet altijd van boven naar beneden. Een lijst met koppen moet daarom al genoeg context geven om een relevant onderdeel te herkennen. “Wat kost onderhoud?” is duidelijker dan “Kosten”, en “Welke documenten heb je nodig?” zegt meer dan “Voorbereiding”.',
          'Houd een kop wel beknopt. Zet uitleg, voorwaarden en uitzonderingen in de alinea eronder. Controleer bovendien of meerdere koppen op dezelfde pagina niet allemaal “Onze aanpak” of “Voordelen” heten, want dan is het onderscheid tussen de secties alsnog klein.',
        ],
      },
      {
        heading: 'Controleer de structuur zonder naar het ontwerp te kijken',
        paragraphs: [
          'Lees alleen de koppen in volgorde, bijvoorbeeld via de toegankelijkheidsweergave van je browser of een heading-overzicht. Je moet het onderwerp, de hoofdonderdelen en eventuele subonderdelen kunnen herkennen zonder de tussenliggende tekst te lezen.',
          'Bekijk daarna de pagina op mobiel en desktop. De betekenisvolle volgorde hoort gelijk te blijven, ook wanneer onderdelen visueel naast elkaar of onder elkaar worden gezet. Pas een kop aan als hij afbreekt op een onduidelijke plek, maar verander het niveau alleen wanneer de inhoudelijke relatie verandert.',
        ],
        bullets: [
          'De H1 vat het hoofdonderwerp van de pagina samen.',
          'Iedere H2 introduceert een zelfstandig hoofdonderdeel.',
          'Een H3 hoort inhoudelijk bij de H2 erboven.',
          'De niveaus worden niet gekozen op basis van lettergrootte.',
          'Tekst die eruitziet als een kop is ook als kop gemarkeerd.',
          'Iedere kop beschrijft concreet wat erop volgt.',
          'De lijst met koppen vormt een begrijpelijke paginaopbouw.',
          'De structuur blijft logisch op mobiel en desktop.',
        ],
      },
    ],
    relatedLinks: [
      { label: 'Lees wat je op een pagina voor je dienst zet', href: '/blog/welke-informatie-hoort-op-een-dienstenpagina' },
      { label: 'Lees hoe je een paginatitel en metabeschrijving schrijft', href: '/blog/hoe-schrijf-je-een-goede-paginatitel-en-metabeschrijving' },
    ],
  },
  {
    slug: 'hoe-schrijf-je-een-goede-paginatitel-en-metabeschrijving',
    status: 'published',
    title: 'Hoe schrijf je een paginatitel en meta description?',
    description: 'Schrijf per webpagina een duidelijke titel en metabeschrijving die het onderwerp, de doelgroep en de inhoud eerlijk samenvatten, met voorbeelden en een controlelijst.',
    excerpt: 'Een paginatitel en metabeschrijving helpen mensen een zoekresultaat te beoordelen. Schrijf ze per pagina, concreet en in lijn met wat de bezoeker werkelijk aantreft.',
    category: 'SEO',
    primaryKeyword: 'paginatitel en metabeschrijving schrijven',
    secondaryKeywords: ['goede SEO-titel schrijven', 'meta description schrijven', 'titel en description website'],
    searchIntent: 'Een duidelijke paginatitel en metabeschrijving voor een zakelijke webpagina schrijven',
    publishedAt: '2026-09-25',
    updatedAt: '2026-09-25',
    author: 'Jannik',
    reviewer: 'Jannik',
    readingTime: '6 minuten',
    sources: [
      'https://developers.google.com/search/docs/appearance/title-link',
      'https://developers.google.com/search/docs/appearance/snippet',
      'https://www.w3.org/WAI/WCAG22/Understanding/page-titled.html',
    ],
    sections: [
      {
        heading: 'Ken de taak van beide teksten',
        paragraphs: [
          'De paginatitel staat in het title-element van de pagina. Browsers gebruiken die tekst onder meer voor het tabblad. Google kan hem als basis gebruiken voor de klikbare titel van een zoekresultaat. De metabeschrijving is een korte samenvatting in de paginacode en kan als beschrijvende tekst onder die titel verschijnen.',
          'Zie beide teksten als een voorstel, niet als een vaste advertentie. Google bepaalt title-links en snippets automatisch en gebruikt daarvoor meerdere bronnen. De uiteindelijke tekst kan dus afwijken van wat je invult. Zorg daarom dat ook de zichtbare kop en de gewone pagina-inhoud duidelijk zijn.',
        ],
      },
      {
        heading: 'Bepaal eerst de ene taak van de pagina',
        paragraphs: [
          'Vat vóór het schrijven in één zin samen waarvoor de pagina bestaat. Een dienstenpagina moet bijvoorbeeld één concrete dienst uitleggen, terwijl een contactpagina vooral moet vertellen hoe iemand contact opneemt. Die taak vormt de kern van de titel en de beschrijving.',
          'Probeer niet al je diensten en zoekwoorden in iedere titel te stoppen. Google adviseert beschrijvende, beknopte en onderscheidende titels per pagina. Met een eigen onderwerp per pagina voorkom je bovendien dat verschillende resultaten uit je site nauwelijks van elkaar te onderscheiden zijn.',
        ],
      },
      {
        heading: 'Schrijf de paginatitel specifiek en herkenbaar',
        paragraphs: [
          'Zet het onderscheidende onderwerp vooraan en voeg alleen context toe die iemand nodig heeft om de pagina te herkennen. “Arbeidsrechtelijk advies voor werkgevers | Bedrijfsnaam” zegt bijvoorbeeld meer dan “Diensten | Bedrijfsnaam”. Voor een contactpagina kan “Contact opnemen met Bedrijfsnaam” al voldoende zijn.',
          'Gebruik de bedrijfsnaam consequent en beknopt, meestal aan het begin of einde met een duidelijk scheidingsteken. Vermijd herhaalde varianten van hetzelfde zoekwoord. Zo blijft de titel leesbaar en hoeft de belangrijkste informatie niet tussen losse trefwoorden te worden gezocht.',
        ],
      },
      {
        heading: 'Laat titel, hoofdkop en inhoud hetzelfde verhaal vertellen',
        paragraphs: [
          'De title-tag en de zichtbare hoofdkop hoeven niet woordelijk gelijk te zijn, maar ze moeten wel dezelfde verwachting geven. Een titel over onderhoudskosten hoort niet uit te komen op een algemene verkooppagina zonder uitleg over die kosten.',
          'Google gebruikt naast het title-element ook de zichtbare hoofdtitel, koppen, prominente tekst en links bij het bepalen van een title-link. Een duidelijke, opvallende hoofdkop helpt daarom om het hoofdonderwerp van de pagina herkenbaar te houden. W3C adviseert daarnaast dat een paginatitel het onderwerp of doel van de pagina beschrijft, zodat bezoekers pagina’s kunnen herkennen en onderscheiden.',
        ],
      },
      {
        heading: 'Vat in de metabeschrijving samen wat iemand krijgt',
        paragraphs: [
          'Schrijf één of twee natuurlijke zinnen die de specifieke pagina samenvatten. Noem het onderwerp, voor wie de informatie bedoeld is en welke inhoud of vervolgstap op de pagina staat. Gebruik alleen eigenschappen, prijzen of voorwaarden die op de pagina zelf kloppen en actueel zijn.',
          'Vermijd een rij losse zoekwoorden en algemene teksten die op iedere pagina passen. Google adviseert unieke beschrijvingen die de betreffende pagina nauwkeurig beschrijven. Een bruikbare opzet is: “Lees hoe [onderwerp] werkt, welke keuzes je maakt en wat je nodig hebt om [concrete taak] uit te voeren.”',
        ],
      },
      {
        heading: 'Werk niet met een gegarandeerde tekenlimiet',
        paragraphs: [
          'Er is geen vaste lengte waarmee je volledige weergave kunt garanderen. Google geeft aan dat title-links en snippets waar nodig worden ingekort, doorgaans om binnen de beschikbare breedte van het apparaat te passen. Een snippet kan bovendien per zoekopdracht verschillen.',
          'Schrijf daarom eerst de belangrijkste informatie en schrap woorden die niets toevoegen. Controleer of de titel en beschrijving ook begrijpelijk blijven wanneer het laatste deel niet wordt getoond. Maak een tekst niet kunstmatig langer om een teller te vullen en stop hem niet vol met synoniemen.',
        ],
      },
      {
        heading: 'Controleer iedere pagina afzonderlijk',
        paragraphs: [
          'Loop de belangrijkste pagina’s één voor één na. Bekijk niet alleen het invoerveld in je beheersysteem, maar ook de uiteindelijke paginacode, het browsertabblad en de zichtbare hoofdkop. Na een wijziging kan het enige tijd duren voordat een zoekmachine de pagina opnieuw heeft verwerkt.',
        ],
        bullets: [
          'Iedere indexeerbare pagina heeft een eigen, beschrijvende paginatitel.',
          'Het onderscheidende onderwerp staat vroeg in de titel.',
          'De bedrijfsnaam is kort en consequent toegevoegd waar dat nuttig is.',
          'Titel, hoofdkop en pagina-inhoud geven dezelfde verwachting.',
          'De metabeschrijving vat deze specifieke pagina eerlijk samen.',
          'De tekst bevat geen onbewezen voordeel, verouderde prijs of loze belofte.',
          'Titel en beschrijving blijven duidelijk als het einde wordt afgekapt.',
          'De uiteindelijke HTML bevat de bedoelde title-tag en metabeschrijving.',
        ],
      },
    ],
    relatedLinks: [
      { label: 'Lees welke informatie op een dienstenpagina hoort', href: '/blog/welke-informatie-hoort-op-een-dienstenpagina' },
      { label: 'Lees hoe je duidelijke link- en knopteksten schrijft', href: '/blog/hoe-schrijf-je-duidelijke-link-en-knopteksten' },
    ],
  },
  {
    slug: 'hoe-maak-je-foutmeldingen-in-een-formulier-duidelijk',
    status: 'published',
    title: 'Hoe maak je foutmeldingen in een formulier duidelijk?',
    description: 'Schrijf en plaats formulierfouten zo dat bezoekers zien welk veld niet klopt, waarom de invoer is geweigerd en hoe zij het probleem kunnen herstellen.',
    excerpt: 'Een melding als “Er ging iets mis” helpt niemand verder. Een bruikbare foutmelding wijst het juiste veld aan, beschrijft het probleem en geeft een concrete oplossing.',
    category: 'Toegankelijkheid',
    primaryKeyword: 'duidelijke foutmeldingen formulier',
    secondaryKeywords: ['foutmelding formulier schrijven', 'formulierfouten tonen', 'toegankelijk formulier foutmelding'],
    searchIntent: 'Duidelijke en herstelbare foutmeldingen voor een webformulier maken',
    publishedAt: '2026-09-11',
    updatedAt: '2026-09-11',
    author: 'Jannik',
    reviewer: 'Jannik',
    readingTime: '6 minuten',
    sources: [
      'https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html',
      'https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html',
      'https://www.w3.org/WAI/WCAG22/Understanding/error-suggestion.html',
      'https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html',
    ],
    sections: [
      {
        heading: 'Voorkom fouten met duidelijke labels en instructies',
        paragraphs: [
          'Een goede foutmelding begint vóór iemand op verzenden klikt. Geef ieder veld een zichtbaar, beschrijvend label en zet afwijkende invoerregels bij het veld. Denk aan een verplicht bestandsformaat, een maximale bestandsgrootte of de manier waarop een datum moet worden ingevuld.',
          'W3C schrijft voor dat labels of instructies beschikbaar moeten zijn wanneer een formulier invoer verwacht. Geef alleen uitleg die nodig is om de taak uit te voeren. Een lange algemene handleiding boven het formulier is minder bruikbaar dan een korte aanwijzing op de plek waar die geldt.',
        ],
      },
      {
        heading: 'Benoem het veld en het concrete probleem',
        paragraphs: [
          'Schrijf niet alleen “Ongeldige invoer” of “Er ging iets mis”. Noem welk veld aandacht nodig heeft en wat er niet klopt. “Vul je e-mailadres in” en “Het e-mailadres mist een @-teken” geven veel meer richting.',
          'Volgens W3C moet een automatisch gevonden invoerfout in tekst worden beschreven en moet duidelijk zijn bij welk onderdeel de fout hoort. Kleur, een rand of een pictogram kan extra opvallen, maar mag niet de enige aanwijzing zijn.',
        ],
        bullets: [
          'Te algemeen: “Dit veld is ongeldig.”',
          'Concreet: “Vul je telefoonnummer in met alleen cijfers.”',
          'Te algemeen: “Verzenden mislukt.”',
          'Concreet: “Kies eerst een onderwerp voordat je het formulier verstuurt.”',
        ],
      },
      {
        heading: 'Vertel hoe de bezoeker de fout kan herstellen',
        paragraphs: [
          'Een fout beschrijven is niet altijd genoeg. Als de juiste oplossing bekend is, zet die dan in dezelfde melding. Noem bijvoorbeeld het verwachte formaat, de toegestane waarden of de ontbrekende stap.',
          'W3C vraagt om een herstelsuggestie wanneer een invoerfout automatisch wordt gevonden en een passende oplossing bekend is, behalve wanneer zo’n suggestie de beveiliging of het doel van de inhoud zou schaden. Geef dus gerichte hulp zonder gevoelige controles of beveiligingsregels prijs te geven.',
        ],
      },
      {
        heading: 'Plaats de melding bij het veld en geef een overzicht',
        paragraphs: [
          'Zet een fouttekst direct bij het betreffende veld, zodat de relatie zichtbaar blijft. Bij een langer formulier kan een overzicht bovenaan daarnaast handig zijn. Laat ieder item in dat overzicht naar het foutieve veld verwijzen, zodat een bezoeker niet opnieuw het hele formulier hoeft te doorzoeken.',
          'W3C schrijft geen vaste visuele plaats voor: fouten mogen bij velden, vóór het formulier, in een melding of in een dialoog staan. Kies een opzet die het probleem in tekst beschrijft en de route naar het veld kort houdt.',
        ],
      },
      {
        heading: 'Bewaar correcte invoer na een mislukte poging',
        paragraphs: [
          'Wis geen correct ingevulde velden wanneer één onderdeel niet klopt. Laat de bezoeker alleen herstellen wat nodig is. Wees extra voorzichtig met wachtwoorden en andere gevoelige invoer: bepaal daarvoor bewust wat veilig kan worden bewaard of opnieuw moet worden gevraagd.',
          'Controleer ook wat er gebeurt bij een technische storing. Maak onderscheid tussen een invoerfout en een probleem aan de kant van de website. Bij een storing is “Probeer het later opnieuw” eerlijker dan een willekeurig veld als fout aanwijzen.',
        ],
      },
      {
        heading: 'Maak dynamische meldingen merkbaar zonder onverwachte sprong',
        paragraphs: [
          'Verschijnt een foutmelding zonder dat de pagina opnieuw laadt of de focus verandert, zorg dan dat hulptechnologie die wijziging kan herkennen. W3C beschrijft dat statusmeldingen via een passende rol of eigenschap beschikbaar moeten zijn, zodat ze zonder focusverplaatsing kunnen worden aangekondigd.',
          'Verplaats de toetsenbordfocus alleen doelgericht. Bij een volledig foutenoverzicht kan focus naar dat overzicht logisch zijn; bij controle tijdens het typen kan een aangekondigde melding voldoende zijn. Voorkom dat de cursor na iedere kleine fout onverwacht uit het veld springt.',
        ],
      },
      {
        heading: 'Test het hele herstelpad',
        paragraphs: [
          'Test niet alleen of het formulier verzendt. Probeer elk verplicht veld leeg te laten, gebruik ongeldige formaten en veroorzaak meerdere fouten tegelijk. Herhaal dit met toetsenbordbediening en controleer op mobiel of meldingen, velden en herstelacties samen in beeld blijven.',
        ],
        bullets: [
          'Ieder veld heeft een zichtbaar en duidelijk label.',
          'Invoerregels staan vóór de fout al bij het veld.',
          'Elke fout benoemt het veld en het concrete probleem.',
          'Een bekende oplossing staat in de melding.',
          'Kleur is niet de enige manier waarop een fout herkenbaar is.',
          'Correcte invoer blijft staan na een mislukte verzending.',
          'Dynamische meldingen zijn ook voor hulptechnologie merkbaar.',
          'De succesmelding bevestigt duidelijk dat het formulier is verzonden.',
        ],
      },
    ],
    relatedLinks: [
      { label: 'Lees welke velden een contactformulier nodig heeft', href: '/blog/welke-velden-heeft-een-contactformulier-nodig' },
      { label: 'Lees hoe je duidelijke link- en knopteksten schrijft', href: '/blog/hoe-schrijf-je-duidelijke-link-en-knopteksten' },
    ],
  },
  {
    slug: 'hoe-schrijf-je-duidelijke-link-en-knopteksten',
    status: 'published',
    title: 'Hoe schrijf je duidelijke link- en knopteksten?',
    description: 'Schrijf link- en knopteksten die vooraf duidelijk maken waar een bezoeker terechtkomt of welke actie er wordt uitgevoerd, met concrete voorbeelden en een controlelijst.',
    excerpt: 'Een goede link of knop vertelt vóór de klik wat er daarna gebeurt. Met een paar gerichte keuzes maak je iedere vervolgstap duidelijker en beter te controleren.',
    category: 'Website-inhoud',
    primaryKeyword: 'hoe schrijf je goede linkteksten',
    secondaryKeywords: ['duidelijke knoptekst', 'linktekst schrijven', 'call-to-action tekst'],
    searchIntent: 'Duidelijke link- en knopteksten voor een zakelijke website schrijven',
    publishedAt: '2026-09-04',
    updatedAt: '2026-09-04',
    author: 'Jannik',
    reviewer: 'Jannik',
    readingTime: '6 minuten',
    sources: [
      'https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-in-context.html',
      'https://www.w3.org/WAI/tips/writing/',
      'https://www.w3.org/WAI/ARIA/apg/patterns/link/',
      'https://www.w3.org/WAI/ARIA/apg/patterns/button/',
      'https://developers.google.com/search/docs/crawling-indexing/links-crawlable',
    ],
    sections: [
      {
        heading: 'Begin met wat er na de klik gebeurt',
        paragraphs: [
          'Schrijf niet eerst een aantrekkelijke kreet en zoek daar later een bestemming bij. Bepaal eerst wat een bezoeker na de klik ziet of doet. Benoem daarna die uitkomst zo direct mogelijk in de zichtbare tekst.',
          '“Bekijk de websitepakketten” vertelt bijvoorbeeld welke informatie volgt. “Ontdek meer” laat dat open. W3C adviseert dat het doel van een link uit de linktekst zelf of uit de direct samenhangende context kan worden bepaald. Een zelfstandige, beschrijvende tekst is daarom een praktisch uitgangspunt.',
        ],
      },
      {
        heading: 'Gebruik een link voor een bestemming en een knop voor een actie',
        paragraphs: [
          'Een link verwijst naar een bron of plek, binnen of buiten de huidige pagina. Een knop start een actie of gebeurtenis, zoals een formulier verzenden, een dialoog openen of een menu sluiten. W3C maakt dit onderscheid expliciet in de patronen voor links en knoppen.',
          'De vormgeving mag bij elkaar passen, maar de technische functie moet kloppen. Gebruik dus een echte link met een bestemming voor “Bekijk ons werk” en een knop voor “Verstuur aanvraag”. Dat geeft browsers en hulptechnologie de juiste betekenis en het verwachte toetsenbordgedrag.',
        ],
        bullets: [
          'Naar een andere pagina of sectie: gebruik een link.',
          'Een formulier versturen of een onderdeel openen: gebruik een knop.',
          'Een bestand openen: gebruik een link en benoem zo nodig het bestandstype.',
          'Een menu openen of sluiten: gebruik een knop en laat de status technisch herkennen.',
        ],
      },
      {
        heading: 'Vervang algemene woorden door een concrete bestemming',
        paragraphs: [
          'Teksten als “klik hier”, “lees meer” en “bekijk” zijn op zichzelf niet duidelijk. Voeg het onderwerp of de bestemming toe: “Lees hoe de intake werkt”, “Bekijk het Starter-pakket” of “Download de projectbriefing als pdf”.',
          'Dit helpt ook wanneer iemand alleen de links op een pagina doorloopt. W3C beschrijft dat hulptechnologie een losse lijst met links kan aanbieden. Google adviseert bovendien beschrijvende, beknopte linktekst die relevant is voor de huidige pagina en de doelpagina.',
        ],
      },
      {
        heading: 'Laat een knop beginnen met een herkenbare handeling',
        paragraphs: [
          'Een knoptekst werkt meestal goed wanneer hij met een werkwoord begint en het directe gevolg benoemt. Denk aan “Plan een kennismaking”, “Stuur mijn vraag” of “Open het menu”. De bezoeker hoeft dan niet uit kleur, positie of omringende tekst af te leiden wat de knop doet.',
          'Stem de woorden af op het werkelijke moment in het proces. Een knop die alleen een formulier opent, belooft nog geen afspraak. Schrijf dan bijvoorbeeld “Open het aanvraagformulier” in plaats van “Afspraak bevestigd”.',
        ],
      },
      {
        heading: 'Houd dezelfde bestemming herkenbaar',
        paragraphs: [
          'Links die op dezelfde pagina dezelfde bestemming hebben, geef je bij voorkeur een herkenbare, consistente beschrijving. Links met verschillende bestemmingen moeten juist niet allemaal dezelfde algemene tekst krijgen. W3C noemt beide keuzes als goede praktijk.',
          'Je hoeft niet iedere herhaling woordelijk gelijk te maken. “Bekijk de websitepakketten” en “Vergelijk de pakketten” kunnen allebei duidelijk naar hetzelfde overzicht wijzen. Controleer vooral of de bezoeker dezelfde verwachting krijgt en of twee identieke teksten niet onverwacht naar verschillende pagina’s leiden.',
        ],
      },
      {
        heading: 'Schrijf voor de zichtbare tekst, niet alleen voor techniek',
        paragraphs: [
          'Verstop de echte betekenis niet uitsluitend in een title-attribuut of andere extra techniek. Zorg dat de zichtbare link- of knoptekst zelf bruikbaar is. Dat helpt bezoekers die de pagina lezen, scannen, voorlezen of met het toetsenbord bedienen.',
          'Is een pictogram de enige inhoud van een knop, dan heeft die knop een toegankelijke naam nodig. Staat er al zichtbare tekst naast het pictogram, voorkom dan dat dezelfde naam onnodig dubbel wordt voorgelezen. Het eerdere artikel over alt-tekst legt die keuze voor functionele afbeeldingen verder uit.',
        ],
      },
      {
        heading: 'Controleer de teksten los van het ontwerp',
        paragraphs: [
          'Maak een lijst van alle links en knoppen op de pagina en lees alleen die teksten. Kun je bij ieder item voorspellen waar je terechtkomt of welke actie begint? Pas algemene of misleidende woorden aan en test daarna de echte werking.',
        ],
        bullets: [
          'De tekst benoemt een bestemming of handeling.',
          'Een link heeft een echte, werkende bestemming.',
          'Een knop voert de beschreven actie uit.',
          'De formulering past bij de fase van de bezoeker.',
          'Dezelfde tekst leidt niet naar verschillende bestemmingen.',
          'De tekst blijft op mobiel leesbaar zonder betekenisvolle woorden weg te laten.',
          'Toetsenbord- en schermlezergebruik geven dezelfde verwachting als de zichtbare tekst.',
        ],
      },
    ],
    relatedLinks: [
      { label: 'Lees welke informatie op een dienstenpagina hoort', href: '/blog/welke-informatie-hoort-op-een-dienstenpagina' },
      { label: 'Lees wanneer een afbeelding alt-tekst nodig heeft', href: '/blog/wanneer-heeft-een-afbeelding-alt-tekst-nodig' },
    ],
  },
  {
    slug: 'wanneer-heeft-een-afbeelding-alt-tekst-nodig',
    status: 'published',
    title: 'Wanneer heeft een afbeelding alt-tekst nodig?',
    description: 'Bepaal per websiteafbeelding of de alt-tekst de inhoud, de actie of niets moet beschrijven, met voorbeelden voor foto\'s, iconen, logo\'s en grafieken.',
    excerpt: 'Goede alt-tekst beschrijft niet automatisch alles wat je ziet. De juiste keuze hangt af van wat de afbeelding op die plek toevoegt of doet.',
    category: 'Toegankelijkheid',
    primaryKeyword: 'wanneer heeft een afbeelding alt-tekst nodig',
    secondaryKeywords: ['alt-tekst schrijven', 'alt-tekst afbeelding', 'afbeeldingen toegankelijk maken'],
    searchIntent: 'Bepalen welke alt-tekst een websiteafbeelding nodig heeft',
    publishedAt: '2026-08-28',
    updatedAt: '2026-08-28',
    author: 'Jannik',
    reviewer: 'Jannik',
    readingTime: '6 minuten',
    sources: [
      'https://www.w3.org/WAI/tutorials/images/',
      'https://www.w3.org/WAI/tutorials/images/decision-tree/',
      'https://www.w3.org/WAI/tutorials/images/functional/',
      'https://www.w3.org/WAI/tutorials/images/complex/',
    ],
    sections: [
      {
        heading: 'Begin bij de taak van de afbeelding',
        paragraphs: [
          'Schrijf alt-tekst niet los van de pagina. Dezelfde foto kan op de ene plek belangrijke informatie geven en op een andere plek alleen sfeer toevoegen. Vraag daarom eerst wat een bezoeker mist wanneer de afbeelding niet zichtbaar is.',
          'W3C onderscheidt onder meer informatieve, decoratieve, functionele en complexe afbeeldingen. Die functie bepaalt of de alt-tekst de inhoud beschrijft, een actie benoemt of leeg blijft.',
        ],
      },
      {
        heading: 'Beschrijf bij een informatieve afbeelding wat ertoe doet',
        paragraphs: [
          'Een informatieve foto, illustratie of eenvoudig schema krijgt een korte beschrijving van de informatie die relevant is voor de pagina. Beschrijf dus niet ieder zichtbaar detail, maar wel wat de afbeelding aan de tekst toevoegt.',
          'Bij een projectfoto kan “Mobiele homepage met één blauwe aanvraagknop onder de introductie” nuttig zijn wanneer juist die opbouw wordt besproken. “Screenshot website” zegt dan te weinig. Formuleer de tekst zo dat hij de afbeelding op deze plek kan vervangen zonder de betekenis van de pagina te veranderen.',
        ],
      },
      {
        heading: 'Laat de alt-tekst leeg bij decoratie en herhaling',
        paragraphs: [
          'Een puur decoratieve afbeelding heeft geen inhoudelijke taak. Gebruik daarvoor een leeg alt-attribuut. Zo kan hulptechnologie de afbeelding overslaan zonder dat de afbeelding technisch ontbreekt.',
          'Hetzelfde geldt wanneer zichtbare tekst direct naast de afbeelding al precies dezelfde informatie geeft. Nogmaals dezelfde woorden laten voorlezen voegt dan niets toe. Laat het alt-attribuut wel aanwezig; leeg is een bewuste keuze en iets anders dan een ontbrekend attribuut.',
        ],
        bullets: [
          'Een achtergrondvorm die alleen kleur toevoegt.',
          'Een sfeerfoto zonder nieuwe informatie.',
          'Een pictogram naast tekst die dezelfde actie al volledig benoemt.',
          'Een afbeelding waarvan de inhoud direct ernaast als gewone tekst staat.',
        ],
      },
      {
        heading: 'Benoem bij een klikbare afbeelding de actie',
        paragraphs: [
          'Staat een afbeelding alleen in een link of knop, beschrijf dan het doel in plaats van het uiterlijk. “Zoeken” is duidelijker dan “vergrootglas” en “Naar de homepage” duidelijker dan “bedrijfslogo”.',
          'Staat naast het pictogram al een volledige knoptekst, dan kan het pictogram meestal een lege alt-tekst krijgen. De toegankelijke naam van de knop staat dan al in de gewone tekst en hoeft niet te worden herhaald.',
        ],
      },
      {
        heading: 'Zet tekst liever niet vast in een afbeelding',
        paragraphs: [
          'Gewone webtekst is beter aanpasbaar dan tekst die in een afbeelding is ingebakken. W3C adviseert afbeeldingen van tekst te vermijden, behalve in situaties zoals een logo. Moet de afbeelding toch woorden overbrengen die nergens anders staan, neem die woorden dan op in de alt-tekst.',
          'Controleer ook of een logo informatie toevoegt of een functie heeft. Een los logo kan de organisatienaam nodig hebben. Een logo dat als enige inhoud naar de homepage linkt, heeft een tekstalternatief nodig dat die bestemming duidelijk maakt.',
        ],
      },
      {
        heading: 'Geef een grafiek ook een volledige tekstuele uitleg',
        paragraphs: [
          'Een grafiek, infographic of uitgebreid diagram bevat vaak te veel informatie voor één korte alt-tekst. Geef de afbeelding een korte identificatie en zet de gegevens, conclusies of stappen ook als gewone tekst op de pagina.',
          'De tekstuele uitleg moet dezelfde inhoudelijke taak mogelijk maken. Alleen “grafiek van de resultaten” is niet genoeg wanneer de lezer juist waarden, verhoudingen of een proces uit de afbeelding nodig heeft.',
        ],
      },
      {
        heading: 'Controleer iedere afbeelding in haar context',
        paragraphs: [
          'Loop de pagina afbeelding voor afbeelding na. Kijk daarbij niet alleen of een alt-attribuut aanwezig is, maar vooral of de gekozen tekst past bij de taak van de afbeelding op die specifieke plek.',
        ],
        bullets: [
          'Voegt de afbeelding informatie toe? Beschrijf de relevante betekenis kort.',
          'Is de afbeelding decoratief of volledig redundant? Gebruik een leeg alt-attribuut.',
          'Is de afbeelding een link of knop? Benoem de actie of bestemming.',
          'Bevat de afbeelding tekst die nergens anders staat? Neem die woorden over.',
          'Is de afbeelding complex? Geef de volledige informatie ook als gewone tekst.',
          'Lees de pagina zonder afbeeldingen en controleer of de bedoeling behouden blijft.',
        ],
      },
    ],
    relatedLinks: [
      { label: 'Lees welke informatie op een dienstenpagina hoort', href: '/blog/welke-informatie-hoort-op-een-dienstenpagina' },
      { label: 'Lees welke velden een contactformulier nodig heeft', href: '/blog/welke-velden-heeft-een-contactformulier-nodig' },
    ],
  },
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
