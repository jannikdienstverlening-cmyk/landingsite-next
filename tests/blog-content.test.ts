import assert from 'node:assert/strict'
import test from 'node:test'
import { blogPosts, publishedBlogPost, publishedBlogPosts } from '../content/blog-posts'
import { seoPages } from '../content/seo-pages'

test('blogslugs en primaire zoekintenties zijn uniek', () => {
  assert.equal(new Set(blogPosts.map((post) => post.slug)).size, blogPosts.length)
  assert.equal(new Set(blogPosts.map((post) => post.primaryKeyword)).size, blogPosts.length)
})

test('alleen goedgekeurde artikelen op of voor de publicatiedatum zijn publiek', () => {
  const beforeFirstPublication = publishedBlogPosts(new Date('2026-08-06T12:00:00+02:00'))
  assert.equal(beforeFirstPublication.length, 0)
  const onFridayPublication = publishedBlogPosts(new Date('2026-08-07T12:00:00+02:00'))
  assert.equal(onFridayPublication.length, 1)
  assert.equal(onFridayPublication[0]?.slug, 'hoeveel-paginas-heeft-een-zakelijke-website-nodig')
  const onPublicationDate = publishedBlogPosts(new Date('2026-08-11T12:00:00+02:00'))
  assert.equal(onPublicationDate.length, 2)
  assert.equal(onPublicationDate[0]?.slug, 'wat-moet-er-bovenaan-je-website-staan')
  assert.equal(publishedBlogPost('bestaat-niet', new Date('2026-08-11T12:00:00+02:00')), undefined)
})

test('blogindex en gepubliceerd artikel staan in het SEO-register', () => {
  const index = seoPages.find((page) => page.slug === '/blog')
  const article = seoPages.find((page) => page.slug === '/blog/wat-moet-er-bovenaan-je-website-staan')
  const fridayArticle = seoPages.find((page) => page.slug === '/blog/hoeveel-paginas-heeft-een-zakelijke-website-nodig')
  assert.equal(index?.status, 'published')
  assert.equal(index?.includedInSitemap, true)
  assert.equal(article?.status, 'published')
  assert.equal(article?.includedInSitemap, true)
  assert.equal(fridayArticle?.status, 'published')
  assert.equal(fridayArticle?.includedInSitemap, true)
})
