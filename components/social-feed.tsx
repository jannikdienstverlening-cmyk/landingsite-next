import Image from 'next/image'
import { socialFeedItems } from '@/data/social-feed'

export function SocialFeedSection() {
  const [featured, ...profiles] = socialFeedItems

  return (
    <section className="social-feed" id="social" aria-labelledby="social-feed-title" data-analytics-view="social_feed_view">
      <div className="studio-shell">
        <header className="social-feed__head">
          <div>
            <p className="overline">Volg Landingsite</p>
            <h2 id="social-feed-title">Korte checks. Nieuw werk. Achter de schermen.</h2>
          </div>
          <p>Bekijk de nieuwste publicatie of volg Landingsite.nl op het kanaal dat je zelf gebruikt.</p>
        </header>

        <div className="social-feed__viewport">
          <div className="social-feed__grid">
            <a
              className="social-feed__feature"
              href={featured.url}
              target="_blank"
              rel="noopener noreferrer"
              data-analytics-event="social_post_open"
              data-analytics-platform="tiktok"
            >
              <span className="social-feed__media">
                {featured.image && (
                  <Image
                    src={featured.image}
                    alt={featured.imageAlt ?? ''}
                    fill
                    sizes="(max-width: 520px) 82vw, (max-width: 900px) 44vw, 390px"
                  />
                )}
                <span className="social-feed__play" aria-hidden="true" />
              </span>
              <span className="social-feed__copy">
                <span className="social-feed__platform">Nieuw op {featured.platform}</span>
                <strong>{featured.title}</strong>
                <span>{featured.description}</span>
                <b>Bekijk de video <span aria-hidden="true">↗</span></b>
              </span>
            </a>

            {profiles.map((item) => (
              <a
                className={`social-feed__profile social-feed__profile--${item.platform.toLowerCase()}`}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                key={item.platform}
                data-analytics-event="social_post_open"
                data-analytics-platform={item.platform.toLowerCase()}
              >
                <span className="social-feed__platform">{item.platform}</span>
                <strong>{item.title}</strong>
                <span>{item.description}</span>
                <b>Open profiel <span aria-hidden="true">↗</span></b>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
