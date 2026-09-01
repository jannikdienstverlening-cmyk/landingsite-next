import { requiredEnv } from './common'
import { loadActiveSocialConnection } from './connections'
import { InstagramClient } from './instagram'
import { TikTokClient } from './tiktok'

export type SocialPlatform = 'instagram' | 'tiktok'

export async function checkSocialPlatform(platform: SocialPlatform) {
  try {
    const connection = await loadActiveSocialConnection(platform)
    if (platform === 'instagram') {
      const account = await new InstagramClient({
        accessToken: connection.accessToken,
        userId: connection.accountId,
        apiVersion: requiredEnv('INSTAGRAM_GRAPH_API_VERSION'),
      }).getAccount()
      return { connected: true, account: account.username ?? account.id }
    }

    const creator = await new TikTokClient({ accessToken: connection.accessToken }).getCreatorInfo()
    return {
      connected: true,
      account: creator.creator_username,
      publicPostingAvailable: creator.privacy_level_options.includes('PUBLIC_TO_EVERYONE'),
    }
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Onbekende API-fout',
    }
  }
}

export async function checkSocialPlatforms(platforms: SocialPlatform[]) {
  return Object.fromEntries(
    await Promise.all(platforms.map(async (platform) => [
      platform,
      await checkSocialPlatform(platform),
    ] as const)),
  )
}
