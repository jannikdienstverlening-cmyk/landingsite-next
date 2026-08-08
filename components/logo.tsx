import Link from 'next/link'

type LogoProps = {
  variant?: 'dark' | 'light'
}

export function Logo({ variant = 'light' }: LogoProps) {
  return (
    <Link href="/" className={`wordmark wordmark--${variant}`} aria-label="Landingsite.nl, naar de homepage">
      <span>landingsite</span><span className="wordmark__dot">.</span><span>nl</span>
    </Link>
  )
}
