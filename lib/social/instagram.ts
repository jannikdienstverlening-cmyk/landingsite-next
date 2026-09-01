import { SocialApiError, assertHttpsUrl, responseJson, sleep, type FetchLike } from './common'

type InstagramIdResponse = { id: string }

export type InstagramAccount = {
  id: string
  username?: string
  account_type?: string
}

export type InstagramContainerStatus = {
  id?: string
  status_code?: 'EXPIRED' | 'ERROR' | 'FINISHED' | 'IN_PROGRESS' | 'PUBLISHED'
  status?: string
}

export type InstagramClientOptions = {
  accessToken: string
  userId: string
  apiVersion: string
  fetchImpl?: FetchLike
  graphBaseUrl?: string
}

function asIdResponse(value: Record<string, unknown>, operation: string): InstagramIdResponse {
  if (typeof value.id !== 'string' || !value.id) {
    throw new SocialApiError(`Instagram gaf geen ID terug voor ${operation}.`, 'instagram', 502)
  }
  return { id: value.id }
}

export class InstagramClient {
  private readonly fetchImpl: FetchLike
  private readonly baseUrl: string

  constructor(private readonly options: InstagramClientOptions) {
    this.fetchImpl = options.fetchImpl ?? fetch
    this.baseUrl = `${(options.graphBaseUrl ?? 'https://graph.instagram.com').replace(/\/$/u, '')}/${options.apiVersion.replace(/^\//u, '')}`
  }

  private async request(path: string, init?: RequestInit) {
    const response = await this.fetchImpl(`${this.baseUrl}/${path.replace(/^\//u, '')}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${this.options.accessToken}`,
        ...init?.headers,
      },
    })
    const body = await responseJson(response)
    const apiError = body.error as { message?: unknown; code?: unknown; type?: unknown } | undefined
    if (!response.ok || apiError) {
      const code = typeof apiError?.code === 'number' || typeof apiError?.code === 'string'
        ? String(apiError.code)
        : undefined
      const message = typeof apiError?.message === 'string'
        ? apiError.message
        : `Instagram API-aanvraag mislukt (${response.status}).`
      throw new SocialApiError(message, 'instagram', response.status, code)
    }
    return body
  }

  private async postForm(path: string, values: Record<string, string>) {
    return this.request(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(values),
    })
  }

  async getAccount(): Promise<InstagramAccount> {
    const values = await this.request(`${this.options.userId}?fields=id,username,account_type`)
    if (typeof values.id !== 'string') {
      throw new SocialApiError('Instagram-account kon niet worden geverifieerd.', 'instagram', 502)
    }
    return {
      id: values.id,
      username: typeof values.username === 'string' ? values.username : undefined,
      account_type: typeof values.account_type === 'string' ? values.account_type : undefined,
    }
  }

  async createReelContainer(input: {
    videoUrl: string
    caption: string
    shareToFeed?: boolean
    coverUrl?: string
  }) {
    const values: Record<string, string> = {
      media_type: 'REELS',
      video_url: assertHttpsUrl(input.videoUrl, 'Instagram-video-URL'),
      caption: input.caption,
      share_to_feed: String(input.shareToFeed ?? true),
    }
    if (input.coverUrl) values.cover_url = assertHttpsUrl(input.coverUrl, 'Instagram-cover-URL')
    return asIdResponse(await this.postForm(`${this.options.userId}/media`, values), 'de Reel-container')
  }

  async createImageContainer(input: { imageUrl: string; caption?: string; carouselItem?: boolean }) {
    return asIdResponse(await this.postForm(`${this.options.userId}/media`, {
      image_url: assertHttpsUrl(input.imageUrl, 'Instagram-afbeeldings-URL'),
      ...(input.caption ? { caption: input.caption } : {}),
      ...(input.carouselItem ? { is_carousel_item: 'true' } : {}),
    }), 'de afbeeldingscontainer')
  }

  async createCarouselContainer(children: string[], caption: string) {
    if (children.length < 2 || children.length > 10) {
      throw new Error('Een Instagram-carrousel moet 2 tot en met 10 onderdelen bevatten.')
    }
    return asIdResponse(await this.postForm(`${this.options.userId}/media`, {
      media_type: 'CAROUSEL',
      children: children.join(','),
      caption,
    }), 'de carrouselcontainer')
  }

  async getContainerStatus(containerId: string): Promise<InstagramContainerStatus> {
    return await this.request(`${containerId}?fields=id,status_code,status`) as InstagramContainerStatus
  }

  async waitForContainer(containerId: string, options: { attempts?: number; intervalMs?: number } = {}) {
    const attempts = options.attempts ?? 30
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      const status = await this.getContainerStatus(containerId)
      if (status.status_code === 'FINISHED' || status.status_code === 'PUBLISHED') return status
      if (status.status_code === 'ERROR' || status.status_code === 'EXPIRED') {
        throw new SocialApiError(status.status ?? 'Instagram kon de media niet verwerken.', 'instagram', 422, status.status_code)
      }
      if (attempt < attempts - 1) await sleep(options.intervalMs ?? 4000)
    }
    throw new SocialApiError('Instagram-media was niet op tijd gereed voor publicatie.', 'instagram', 408)
  }

  async publishContainer(containerId: string) {
    return asIdResponse(await this.postForm(`${this.options.userId}/media_publish`, {
      creation_id: containerId,
    }), 'de publicatie')
  }

  async getPermalink(mediaId: string) {
    const values = await this.request(`${mediaId}?fields=id,permalink`)
    return typeof values.permalink === 'string' ? values.permalink : null
  }
}
