import assert from 'node:assert/strict'
import test from 'node:test'
import { InstagramClient } from '../lib/social/instagram'
import { instagramAuthorizeUrl, tiktokAuthorizeUrl } from '../lib/social/oauth'
import { TikTokClient } from '../lib/social/tiktok'

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

test('Instagram-client houdt het token uit de URL en maakt een Reel-container', async () => {
  const calls: Array<{ url: string; init?: RequestInit }> = []
  const client = new InstagramClient({
    accessToken: 'secret-token',
    userId: 'ig-123',
    apiVersion: 'v99.0',
    fetchImpl: async (input, init) => {
      calls.push({ url: String(input), init })
      return jsonResponse({ id: 'container-1' })
    },
  })
  const result = await client.createReelContainer({
    videoUrl: 'https://cdn.example.test/video.mp4',
    caption: 'Eén fout, één fix.',
  })
  assert.equal(result.id, 'container-1')
  assert.equal(calls[0].url, 'https://graph.instagram.com/v99.0/ig-123/media')
  assert.equal(new Headers(calls[0].init?.headers).get('authorization'), 'Bearer secret-token')
  assert.equal(calls[0].url.includes('secret-token'), false)
  assert.match(String(calls[0].init?.body), /media_type=REELS/u)
})

test('TikTok-client vraagt actuele creatorinfo vóór een directe upload', async () => {
  const calls: string[] = []
  const client = new TikTokClient({
    accessToken: 'secret-token',
    fetchImpl: async (input) => {
      const url = String(input)
      calls.push(url)
      if (url.endsWith('/creator_info/query/')) return jsonResponse({
        data: {
          creator_username: 'landingsite.nl',
          privacy_level_options: ['PUBLIC_TO_EVERYONE', 'SELF_ONLY'],
          comment_disabled: false,
          duet_disabled: false,
          stitch_disabled: false,
          max_video_post_duration_sec: 180,
        },
        error: { code: 'ok', message: '' },
      })
      return jsonResponse({
        data: { publish_id: 'publish-1', upload_url: 'https://upload.example.test/video' },
        error: { code: 'ok', message: '' },
      })
    },
  })
  const result = await client.initializeFileVideo({
    title: 'Homepagecheck #webdesign',
    privacyLevel: 'PUBLIC_TO_EVERYONE',
    disableComment: false,
    disableDuet: false,
    disableStitch: false,
  }, 1024)
  assert.equal(result.publishId, 'publish-1')
  assert.match(calls[0], /creator_info\/query/u)
  assert.match(calls[1], /video\/init/u)
})

test('TikTok-client blokkeert een privacykeuze die het account niet aanbiedt', async () => {
  const client = new TikTokClient({
    accessToken: 'secret-token',
    fetchImpl: async () => jsonResponse({
      data: {
        creator_username: 'landingsite.nl',
        privacy_level_options: ['SELF_ONLY'],
        comment_disabled: false,
        duet_disabled: false,
        stitch_disabled: false,
        max_video_post_duration_sec: 180,
      },
      error: { code: 'ok', message: '' },
    }),
  })
  await assert.rejects(() => client.initializeUrlVideo({
    title: 'Test',
    privacyLevel: 'PUBLIC_TO_EVERYONE',
    disableComment: false,
    disableDuet: false,
    disableStitch: false,
  }, 'https://cdn.example.test/video.mp4'), /niet beschikbaar/u)
})

test('OAuth-URLs bevatten alleen de vereiste publieke waarden en scopes', () => {
  const instagram = new URL(instagramAuthorizeUrl({
    clientId: 'instagram-app',
    redirectUri: 'https://landingsite.nl/api/admin/social/instagram/callback',
    state: 'state-1',
  }))
  assert.equal(instagram.searchParams.get('state'), 'state-1')
  assert.match(instagram.searchParams.get('scope') ?? '', /instagram_business_content_publish/u)

  const tiktok = new URL(tiktokAuthorizeUrl({
    clientKey: 'tiktok-app',
    redirectUri: 'https://landingsite.nl/api/admin/social/tiktok/callback',
    state: 'state-2',
  }))
  assert.equal(tiktok.searchParams.get('state'), 'state-2')
  assert.match(tiktok.searchParams.get('scope') ?? '', /video\.publish/u)
})
