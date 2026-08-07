import Link from 'next/link'

type LogoProps = {
  variant?: 'dark' | 'light'
}

export function Logo({ variant = 'light' }: LogoProps) {
  return (
    <Link href="/" className={`wordmark wordmark--${variant}`} aria-label="Landingsite.nl, naar de homepage">
      <svg viewBox="0 0 174 30" role="img" aria-hidden="true">
        <text x="0" y="22">landingsite</text>
        <circle cx="133" cy="20" r="2.6" />
        <text x="139" y="22">nl</text>
      </svg>
    </Link>
  )
}
