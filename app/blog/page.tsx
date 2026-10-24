import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { AnalyticsLayer } from '@/components/site-interactions'
import { Breadcrumbs } from '@/components/seo-page'
import { StudioFooter, StudioHeader } from '@/components/studio-site'
import { formatBlogDate, publishedBlogPosts } from '@/content/blog-posts'
import { seoPage } from '@/content/seo-pages'
import { portfolioProjects } from '@/data/portfolio'
import { BUSINESS } from '@/lib/business'
import { seoMetadata } from '@/lib/seo'

const content = seoPage('/blog')
export const metadata: Metadata = seoMetadata(content)

export default function BlogPage() {
  const posts = publishedBlogPosts()
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': `${BUSINESS.website}/blog#blog`,
    name: 'Vrijdagblog van Landingsite.nl',
    description: content.description,
    url: `${BUSINESS.website}/blog`,
    inLanguage: 'nl-NL',
    publisher: { '@id': `${BUSINESS.website}/#organization` },
    blogPost: posts.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      datePublished: post.publishedAt,
      dateModified: post.updatedAt,
      url: `${BUSINESS.website}/blog/${post.slug}`,
    })),
  }

  return (
    <div className="studio studio-page studio--sales blog-page">
      <a className="skip-link" href="#main-content">Ga naar de inhoud</a>
      <AnalyticsLayer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }} />
      <StudioHeader light />
      <Breadcrumbs items={[{ label: 'Blog', href: '/blog' }]} />
      <main id="main-content">
        <header className="blog-hero studio-shell">
          <div>
            <p className="overline">Voor zzp’ers en kleine bedrijven</p>
            <h1>{content.h1}</h1>
            <p>Wat zet je op je website? Hoe maak je contact opnemen makkelijk? In de vrijdagblog vind je korte artikelen met voorbeelden die je zelf kunt gebruiken.</p>
            <a className="button button--outline" href="#artikelen">Bekijk de artikelen</a>
          </div>
          <figure className="blog-hero__visual">
            <Image src={portfolioProjects[0].image} alt="Een voorbeeld uit ons werk: de homepage van Ontwikkelbegeleiding.nl met uitleg over begeleiding en een kennismakingsknop" width={1440} height={1000} sizes="(max-width: 820px) 90vw, 560px" preload />
            <figcaption>Uit ons werk: <Link href={`/werk#${portfolioProjects[0].slug}`}>Ontwikkelbegeleiding.nl</Link></figcaption>
          </figure>
        </header>

        <section className="blog-index studio-shell" id="artikelen" aria-labelledby="blog-index-title">
          <h2 className="sr-only" id="blog-index-title">Alle artikelen</h2>
          {posts.map((post) => (
            <article className="blog-card" key={post.slug}>
              <div className="blog-card__body">
                <div className="blog-card__meta">
                  <span>{post.category}</span>
                  <time dateTime={post.publishedAt}>{formatBlogDate(post.publishedAt)}</time>
                  <span>{post.readingTime}</span>
                </div>
                <h2><Link href={`/blog/${post.slug}`} data-analytics-event="blog_open" data-analytics-slug={post.slug}>{post.title}</Link></h2>
                <p>{post.excerpt}</p>
              </div>
              <Link className="blog-card__link" href={`/blog/${post.slug}`} aria-label={`Lees ${post.title}`} data-analytics-event="blog_open" data-analytics-slug={post.slug}>
                Lees artikel <span aria-hidden="true">↗</span>
              </Link>
            </article>
          ))}
        </section>

        <section className="blog-close">
          <div className="studio-shell blog-close__inner">
            <div><p className="overline">Van lezen naar doen</p><h2>Wil je jouw website duidelijker neerzetten?</h2></div>
            <Link className="button button--primary" href="/start" data-analytics-event="hero_start_click" data-analytics-location="blog">Start mijn website</Link>
          </div>
        </section>
      </main>
      <StudioFooter />
    </div>
  )
}
