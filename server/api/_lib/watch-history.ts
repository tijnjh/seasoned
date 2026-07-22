import type { EventHandlerRequest, H3Event } from 'nitro/h3'
import { getProtonSessionId } from './proton-auth'
import { getProtonLoginStatus } from './proton-cli'
import { createProtonDriveAppDataStore } from './proton-drive-app-data'

interface WatchedEpisode {
  tvShowId: number
  seasonId: number
  episodeId: number
}

interface WatchHistory {
  watchedEpisodes: WatchedEpisode[]
}

export interface AppDataStore<T> {
  read: () => Promise<T | null>
  write: (value: T) => Promise<void>
}

export async function getWatchHistoryStore(event: H3Event<EventHandlerRequest>) {
  const sessionId = getProtonSessionId(event)
  const status = await getProtonLoginStatus(sessionId)

  if (!sessionId || !status.signedIn)
    return

  return createProtonDriveAppDataStore<WatchHistory>(sessionId)
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
