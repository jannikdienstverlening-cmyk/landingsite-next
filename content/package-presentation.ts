import { commercialConfig, type CommercialPackageId } from '@/config/commercial'

// Display copy only. Scope, amounts and checkout links stay in commercialConfig.
const packageCopy = {
  starter: {
    audience: 'Je wilt één dienst of aanbod op één pagina laten zien.',
    texts: 'Jij levert de tekst. Ik maak hem duidelijker.',
    form: 'Een contactformulier',
  },
  pro: {
    audience: 'Je wilt je bedrijf, diensten en werk op aparte pagina’s laten zien.',
    texts: 'Ik werk je teksten uit met de informatie die je aanlevert.',
    form: 'Een uitgebreider contactformulier',
  },
  premium: {
    audience: 'Je wilt meer pagina’s, volledig geschreven teksten en een eigen ontwerp.',
    texts: 'Ik schrijf alle websiteteksten met jouw informatie als basis.',
    form: 'Maximaal twee formulieren',
  },
} satisfies Record<CommercialPackageId, { audience: string; texts: string; form: string }>

export function packagePresentation(id: CommercialPackageId) {
  const item = commercialConfig.packages[id]
  const copy = packageCopy[id]
  return {
    audience: copy.audience,
    specs: [
      { label: 'Pagina’s', value: item.pages === 1 ? `1 pagina, tot ${item.sectionLimit} onderdelen` : `Tot ${item.pages} pagina’s` },
      { label: 'Teksten', value: copy.texts },
      { label: 'Aanpassen', value: `${item.correctionRounds} aanpassingsronde${item.correctionRounds === 1 ? '' : 's'}` },
      { label: 'Contact', value: copy.form },
    ],
  }
}
