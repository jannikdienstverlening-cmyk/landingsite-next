export type VendorRecord = {
  name: string
  purpose: string
  data: string
  customerSubprocessor: boolean
  active: boolean
  transferSafeguard: string
}

export const vendorRegister: VendorRecord[] = [
  {
    name: 'Vercel',
    purpose: 'Applicatiehosting, serverfuncties en workflows',
    data: 'Technische verzoekgegevens en applicatiedata die een serverfunctie verwerkt',
    customerSubprocessor: true,
    active: true,
    transferSafeguard: 'Leveranciersvoorwaarden en passende doorgiftewaarborg waar nodig',
  },
  {
    name: 'Supabase',
    purpose: 'Database en afgeschermde bestandsopslag',
    data: 'Orders, intakegegevens, partneradministratie en klantassets',
    customerSubprocessor: true,
    active: true,
    transferSafeguard: 'Leveranciersvoorwaarden en passende doorgiftewaarborg waar nodig',
  },
  {
    name: 'Stripe',
    purpose: 'Betalingen, abonnementen, facturen en klantportaal',
    data: 'Factuurgegevens, betaalstatus en Stripe-referenties',
    customerSubprocessor: false,
    active: true,
    transferSafeguard: 'Stripe verwerkt een deel als zelfstandige verwerkingsverantwoordelijke',
  },
  {
    name: 'Resend',
    purpose: 'Transactionele e-mail',
    data: 'E-mailadres en inhoud van noodzakelijke serviceberichten',
    customerSubprocessor: true,
    active: true,
    transferSafeguard: 'Leveranciersvoorwaarden en passende doorgiftewaarborg waar nodig',
  },
  {
    name: 'Anthropic',
    purpose: 'Ondersteuning bij conceptstructuur en conceptcopy',
    data: 'Relevante zakelijke intake-inhoud; geen beeldbestanden of interne assetreferenties',
    customerSubprocessor: true,
    active: true,
    transferSafeguard: 'Leveranciersvoorwaarden en passende doorgiftewaarborg waar nodig',
  },
  {
    name: 'Netlify',
    purpose: 'Publicatie van opgeleverde klantwebsites waar dit technisch wordt gebruikt',
    data: 'Gepubliceerde websitecontent en technische formulierverwerking',
    customerSubprocessor: true,
    active: true,
    transferSafeguard: 'Leveranciersvoorwaarden en passende doorgiftewaarborg waar nodig',
  },
  {
    name: 'Google',
    purpose: 'Toestemmingsgestuurde gebruiks- en campagnemeting',
    data: 'Pagina, apparaatcategorie en campagnegegevens; geen vrije formulierinhoud',
    customerSubprocessor: false,
    active: process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true' && Boolean(process.env.NEXT_PUBLIC_GOOGLE_MEASUREMENT_ID || process.env.NEXT_PUBLIC_GOOGLE_ADS_ID),
    transferSafeguard: 'Alleen geladen na passende toestemming; leveranciersvoorwaarden en passende doorgiftewaarborg waar nodig',
  },
  {
    name: 'Meta',
    purpose: 'Toestemmingsgestuurde campagnemeting',
    data: 'Pagina en beperkte campagnegebeurtenissen; geen vrije formulierinhoud',
    customerSubprocessor: false,
    active: process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true' && Boolean(process.env.NEXT_PUBLIC_META_PIXEL_ID),
    transferSafeguard: 'Alleen geladen na marketingtoestemming; leveranciersvoorwaarden en passende doorgiftewaarborg waar nodig',
  },
]

export const activeVendors = vendorRegister.filter((vendor) => vendor.active)
export const customerDataSubprocessors = activeVendors.filter((vendor) => vendor.customerSubprocessor)
