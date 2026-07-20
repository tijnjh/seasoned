import type { TrackerData, TrackerStorage } from './tracker-storage'
import { drive, auth as googleAuth } from '@googleapis/drive'
import {
  getRequestHeaders,
  setResponseHeader,
} from '@tanstack/react-start/server'
import { auth } from './auth'
import {
  createGoogleDriveStorage,
} from './tracker-storage'

export async function getTrackerStorage() {
  const headers = getRequestHeaders()
  const session = await auth.api.getSession({ headers })

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
    setResponseHeader('set-cookie', setCookieHeaders)
  }

  const oauth2Client = new googleAuth.OAuth2()

  oauth2Client.setCredentials({
    access_token: tokenResult.response.accessToken,
  })

  const googleDrive = drive({
    version: 'v3',
    auth: oauth2Client,
  })

  return createGoogleDriveStorage<TrackerData>(googleDrive)
}

export async function readTracker(
  storage: TrackerStorage<TrackerData>,
): Promise<TrackerData> {
  const tracker = await storage.read()

  return {
    watchedEpisodes: Array.isArray(tracker?.watchedEpisodes) ? tracker.watchedEpisodes : [],
  }
}
