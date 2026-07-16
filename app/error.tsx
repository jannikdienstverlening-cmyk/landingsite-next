'use client'

import { useEffect } from 'react'

export default function ErrorPage({error,unstable_retry}:{error:Error&{digest?:string};unstable_retry:()=>void}){
  useEffect(()=>{console.error('Onverwachte paginafout',error)},[error])
  return <main className="error-shell"><div><span>Herstelbaar</span><h1>Er ging iets mis.</h1><p>Je gegevens zijn niet automatisch opnieuw verstuurd. Probeer de pagina veilig opnieuw te laden.</p><button type="button" onClick={unstable_retry}>Opnieuw proberen →</button></div></main>
}
