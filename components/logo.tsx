import Image from 'next/image'
import Link from 'next/link'

type LogoProps = {
  variant?: 'dark' | 'light'
}

export function Logo({ variant = 'light' }: LogoProps) {
  return (
    <Link href="/" className={`wordmark wordmark--${variant}`} aria-label="Landingsite.nl, naar de homepage">
      <Image
        src={`/brand/landingsite-wordmark-${variant}.svg`}
        alt=""
        width={341}
        height={64}
        priority
        unoptimized
      />
    </Link>
  )
}
