import type { EventHandlerRequest, H3Event } from 'nitro/h3'
import type { AppDataStore } from './google-drive-app-data'
import { drive, auth as googleAuth } from '@googleapis/drive'
import { auth } from './auth'
import { createGoogleDriveAppDataStore } from './google-drive-app-data'

interface WatchedEpisode {
  tvShowId: number
  seasonId: number
  episodeId: number
}

interface WatchHistory {
  watchedEpisodes: WatchedEpisode[]
}

export async function getWatchHistoryStore(event: H3Event<EventHandlerRequest>) {
  const headers = Object.fromEntries(event.req.headers.entries())

  const session = await auth.api.getSession({
    headers,
  })

  if (!session) {
    return
  }

  const tokenResult = await auth.api.getAccessToken({
    body: { providerId: 'google' },
    headers,
    returnHeaders: true,
  })

  const setCookieHeaders = tokenResult.headers.getSetCookie()

  if (setCookieHeaders.length > 0) {
    setCookieHeaders.forEach(cookie => event.res.headers.append('set-cookie', cookie))
  }

  const oauth2Client = new googleAuth.OAuth2()

  oauth2Client.setCredentials({
    access_token: tokenResult.response.accessToken,
  })

  const googleDrive = drive({
    version: 'v3',
    auth: oauth2Client,
  })

  return createGoogleDriveAppDataStore<WatchHistory>(googleDrive)
}

export async function readWatchHistory(
  store: AppDataStore<WatchHistory>,
): Promise<WatchHistory> {
  const storedHistory = await store.read()

  return {
    watchedEpisodes: Array.isArray(storedHistory?.watchedEpisodes)
      ? storedHistory.watchedEpisodes
      : [],
  }
}
