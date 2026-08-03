import Link from 'next/link'

type LogoProps = {
  variant?: 'default' | 'light'
}

export function Logo({ variant = 'default' }: LogoProps) {
  return (
    <Link
      href="/"
      className={`brand-logo brand-logo--${variant}`}
      aria-label="Landingsite.nl – naar de homepage"
    >
      <span className="brand-logo__main">Landingsite</span>
      <span className="brand-logo__accent">.nl</span>
    </Link>
  )
}
