import type { EventHandlerRequest, H3Event } from 'nitro/h3'
import { drive, auth as googleAuth } from '@googleapis/drive/'
import { auth } from './auth'
import { createGoogleDriveAppDataStore } from './google-drive-app-data'

export async function getWatchHistoryStore(event: H3Event<EventHandlerRequest>) {
  const headers = Object.fromEntries(event.req.headers.entries())

  const session = await auth.api.getSession({
    headers,
  })

  if (!session) {
    return
  }

  const tokenResult = await auth.api.getAccessToken({
    body: { useAccountCookie: true },
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

  return createGoogleDriveAppDataStore(googleDrive, session.user.id)
}
