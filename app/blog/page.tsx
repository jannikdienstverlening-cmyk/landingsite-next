import type { Metadata } from 'next'
import Link from 'next/link'
import { AnalyticsLayer } from '@/components/site-interactions'
import { Breadcrumbs } from '@/components/seo-page'
import { StudioFooter, StudioHeader } from '@/components/studio-site'
import { formatBlogDate, publishedBlogPosts } from '@/content/blog-posts'
import { seoPage } from '@/content/seo-pages'
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
    <div className="studio studio-page blog-page">
      <a className="skip-link" href="#main-content">Ga naar de inhoud</a>
      <AnalyticsLayer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }} />
      <StudioHeader />
      <Breadcrumbs items={[{ label: 'Blog', href: '/blog' }]} />
      <main id="main-content">
        <header className="blog-hero studio-shell">
          <div>
            <p className="overline">Vrijdagblog</p>
            <h1>{content.h1}</h1>
          </div>
          <div className="blog-hero__intro">
            <p>Praktische artikelen over websites, inhoud en beheer voor zzp en mkb. Kort genoeg om direct toe te passen.</p>
            <span>Nieuwe editie op vrijdag</span>
          </div>
        </header>

        <section className="blog-index studio-shell" aria-labelledby="blog-index-title">
          <h2 className="sr-only" id="blog-index-title">Alle artikelen</h2>
          {posts.map((post, index) => (
            <article className="blog-card" key={post.slug}>
              <div className="blog-card__number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</div>
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
            <Link className="button button--light" href="/start" data-analytics-event="hero_start_click" data-analytics-location="blog">Start mijn website</Link>
          </div>
        </section>
      </main>
      <StudioFooter />
    </div>
  )
}
