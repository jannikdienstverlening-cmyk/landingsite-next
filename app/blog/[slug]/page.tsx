import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AnalyticsLayer } from '@/components/site-interactions'
import { Breadcrumbs } from '@/components/seo-page'
import { StudioFooter, StudioHeader } from '@/components/studio-site'
import {
  blogPostCanonical,
  formatBlogDate,
  publishedBlogPost,
  publishedBlogPosts,
} from '@/content/blog-posts'
import { BUSINESS } from '@/lib/business'

type BlogPostPageProps = {
  params: Promise<{ slug: string }>
}

export const dynamicParams = false

export function generateStaticParams() {
  return publishedBlogPosts().map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = publishedBlogPost(slug)
  if (!post) return { title: 'Artikel niet gevonden', robots: { index: false, follow: false } }
  const canonical = blogPostCanonical(post)
  return {
    title: { absolute: `${post.title} | Landingsite.nl` },
    description: post.description,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      type: 'article',
      locale: 'nl_NL',
      siteName: BUSINESS.brandName,
      title: post.title,
      description: post.description,
      url: canonical,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author],
      images: [{ url: '/og/default.png', width: 1200, height: 630, alt: post.title }],
    },
    twitter: { card: 'summary_large_image', title: post.title, description: post.description, images: ['/og/default.png'] },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = publishedBlogPost(slug)
  if (!post) notFound()

  const canonical = blogPostCanonical(post)
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${canonical}#article`,
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    inLanguage: 'nl-NL',
    mainEntityOfPage: canonical,
    author: { '@type': 'Person', name: post.author },
    publisher: { '@id': `${BUSINESS.website}/#organization` },
  }

  return (
    <div className="studio studio-page blog-page">
      <a className="skip-link" href="#main-content">Ga naar de inhoud</a>
      <AnalyticsLayer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }} />
      <StudioHeader />
      <Breadcrumbs items={[{ label: 'Blog', href: '/blog' }, { label: post.title, href: `/blog/${post.slug}` }]} />
      <main id="main-content">
        <article className="blog-article">
          <header className="blog-article__header studio-shell">
            <Link className="blog-back" href="/blog">← Alle artikelen</Link>
            <div className="blog-article__meta">
              <span>{post.category}</span>
              <time dateTime={post.publishedAt}>{formatBlogDate(post.publishedAt)}</time>
              <span>{post.readingTime}</span>
            </div>
            <h1>{post.title}</h1>
            <p>{post.excerpt}</p>
          </header>

          <div className="blog-article__layout studio-shell">
            <aside className="blog-article__aside" aria-label="Artikelinformatie">
              <span>Geschreven door</span>
              <strong>{post.author}</strong>
              <span>Serie</span>
              <strong>Vrijdagblog</strong>
            </aside>
            <div className="blog-article__content">
              {post.sections.map((section) => (
                <section key={section.heading}>
                  <h2>{section.heading}</h2>
                  {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                  {section.bullets && <ul>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}
                </section>
              ))}
              <nav className="blog-related" aria-label="Verder lezen">
                <strong>Verder kijken</strong>
                {post.relatedLinks.map((link) => <Link href={link.href} key={link.href}>{link.label} <span aria-hidden="true">↗</span></Link>)}
              </nav>
            </div>
          </div>
        </article>

        <section className="blog-close">
          <div className="studio-shell blog-close__inner">
            <div><p className="overline">Klaar om te starten?</p><h2>Laat je aanbod helder op de pagina staan.</h2></div>
            <Link className="button button--light" href="/start" data-analytics-event="hero_start_click" data-analytics-location="blog_article">Start mijn website</Link>
          </div>
        </section>
      </main>
      <StudioFooter />
    </div>
  )
}
