import Link from 'next/link'

export default function NotFound(){return <main className="error-shell"><div><span>404</span><h1>Deze route landt nergens.</h1><p>De pagina bestaat niet of is verplaatst. De snelste weg terug is de homepage.</p><Link href="/">Terug naar Landingsite.nl →</Link></div></main>}
