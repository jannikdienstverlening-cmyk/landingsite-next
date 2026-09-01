import { SocialApiError, assertHttpsUrl, responseJson, sleep, type FetchLike } from './common'

export type TikTokPrivacyLevel =
  | 'PUBLIC_TO_EVERYONE'
  | 'MUTUAL_FOLLOW_FRIENDS'
  | 'FOLLOWER_OF_CREATOR'
  | 'SELF_ONLY'

export type TikTokCreatorInfo = {
  creator_username: string
  creator_nickname?: string
  privacy_level_options: TikTokPrivacyLevel[]
  comment_disabled: boolean
  duet_disabled: boolean
  stitch_disabled: boolean
  max_video_post_duration_sec: number
}

export type TikTokPostInfo = {
  title: string
  privacyLevel: TikTokPrivacyLevel
  disableComment: boolean
  disableDuet: boolean
  disableStitch: boolean
  videoCoverTimestampMs?: number
  brandOrganic?: boolean
  isAigc?: boolean
}

export type TikTokPublishStatus = {
  status?: string
  fail_reason?: string
  publicly_available_post_id?: Array<string | number>
  publicaly_available_post_id?: Array<string | number>
  uploaded_bytes?: number
}

export type TikTokClientOptions = {
  accessToken: string
  fetchImpl?: FetchLike
  apiBaseUrl?: string
}

export class TikTokClient {
  private readonly fetchImpl: FetchLike
  private readonly baseUrl: string

  constructor(private readonly options: TikTokClientOptions) {
    this.fetchImpl = options.fetchImpl ?? fetch
    this.baseUrl = (options.apiBaseUrl ?? 'https://open.tiktokapis.com').replace(/\/$/u, '')
  }

  private async post(path: string, payload: Record<string, unknown>) {
    const response = await this.fetchImpl(`${this.baseUrl}/${path.replace(/^\//u, '')}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.options.accessToken}`,
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify(payload),
    })
    const body = await responseJson(response)
    const error = body.error as { code?: unknown; message?: unknown } | undefined
    const errorCode = typeof error?.code === 'string' ? error.code : undefined
    if (!response.ok || (errorCode && errorCode !== 'ok')) {
      const message = typeof error?.message === 'string'
        ? error.message
        : `TikTok API-aanvraag mislukt (${response.status}).`
      throw new SocialApiError(message, 'tiktok', response.status, errorCode)
    }
    return (body.data ?? {}) as Record<string, unknown>
  }

  async getCreatorInfo(): Promise<TikTokCreatorInfo> {
    const data = await this.post('/v2/post/publish/creator_info/query/', {})
    if (typeof data.creator_username !== 'string' || !Array.isArray(data.privacy_level_options)) {
      throw new SocialApiError('TikTok-account kon niet worden geverifieerd.', 'tiktok', 502)
    }
    return data as TikTokCreatorInfo
  }

  private postInfo(input: TikTokPostInfo) {
    return {
      title: input.title,
      privacy_level: input.privacyLevel,
      disable_comment: input.disableComment,
      disable_duet: input.disableDuet,
      disable_stitch: input.disableStitch,
      video_cover_timestamp_ms: input.videoCoverTimestampMs ?? 1000,
      brand_organic_toggle: input.brandOrganic ?? true,
      is_aigc: input.isAigc ?? false,
    }
  }

  private async validatePostInfo(input: TikTokPostInfo) {
    const creator = await this.getCreatorInfo()
    if (!creator.privacy_level_options.includes(input.privacyLevel)) {
      throw new Error(`TikTok-privacy ${input.privacyLevel} is niet beschikbaar voor @${creator.creator_username}.`)
    }
    if (input.title.length > 2200) throw new Error('TikTok-caption is langer dan 2200 tekens.')
    return creator
  }

  async initializeFileVideo(input: TikTokPostInfo, videoSize: number) {
    await this.validatePostInfo(input)
    if (!Number.isSafeInteger(videoSize) || videoSize <= 0) throw new Error('Ongeldige TikTok-videogrootte.')
    const data = await this.post('/v2/post/publish/video/init/', {
      post_info: this.postInfo(input),
      source_info: {
        source: 'FILE_UPLOAD',
        video_size: videoSize,
        chunk_size: videoSize,
        total_chunk_count: 1,
      },
    })
    if (typeof data.publish_id !== 'string' || typeof data.upload_url !== 'string') {
      throw new SocialApiError('TikTok gaf geen uploadgegevens terug.', 'tiktok', 502)
    }
    return { publishId: data.publish_id, uploadUrl: data.upload_url }
  }

  async initializeUrlVideo(input: TikTokPostInfo, videoUrl: string) {
    await this.validatePostInfo(input)
    const data = await this.post('/v2/post/publish/video/init/', {
      post_info: this.postInfo(input),
      source_info: {
        source: 'PULL_FROM_URL',
        video_url: assertHttpsUrl(videoUrl, 'TikTok-video-URL'),
      },
    })
    if (typeof data.publish_id !== 'string') {
      throw new SocialApiError('TikTok gaf geen publicatie-ID terug.', 'tiktok', 502)
    }
    return { publishId: data.publish_id }
  }

  async uploadVideo(uploadUrl: string, bytes: Uint8Array, contentType = 'video/mp4') {
    assertHttpsUrl(uploadUrl, 'TikTok-upload-URL')
    const response = await this.fetchImpl(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(bytes.byteLength),
        'Content-Range': `bytes 0-${bytes.byteLength - 1}/${bytes.byteLength}`,
      },
      body: bytes as BodyInit,
    })
    if (!response.ok) {
      throw new SocialApiError(`TikTok-video-upload mislukt (${response.status}).`, 'tiktok', response.status)
    }
  }

  async getPublishStatus(publishId: string): Promise<TikTokPublishStatus> {
    return await this.post('/v2/post/publish/status/fetch/', { publish_id: publishId }) as TikTokPublishStatus
  }

  async waitForPublish(publishId: string, options: { attempts?: number; intervalMs?: number } = {}) {
    const attempts = options.attempts ?? 30
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      const status = await this.getPublishStatus(publishId)
      if (status.status === 'PUBLISH_COMPLETE' || status.status === 'SEND_TO_USER_INBOX') return status
      if (status.status === 'FAILED') {
        throw new SocialApiError(status.fail_reason ?? 'TikTok-publicatie is mislukt.', 'tiktok', 422, status.fail_reason)
      }
      if (attempt < attempts - 1) await sleep(options.intervalMs ?? 4000)
    }
    throw new SocialApiError('TikTok-publicatie was niet op tijd afgerond.', 'tiktok', 408)
  }
}
