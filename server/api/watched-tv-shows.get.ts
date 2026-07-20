import { defineEventHandler } from 'nitro/h3'
import { tmdb } from './_lib/tmdb'
import { getWatchHistoryStore, readWatchHistory } from './_lib/watch-history.server'

const handler = defineEventHandler(async () => {
  const historyStore = await getWatchHistoryStore()

  if (!historyStore) {
    return {
      signedIn: false,
      tvShows: [],
      watchedEpisodeCountsByTvShowId: {},
    }
  }

  const watchHistory = await readWatchHistory(historyStore)
  const watchedEpisodeCountsByTvShowId: Record<string, number> = {}

  for (const episode of watchHistory.watchedEpisodes) {
    const tvShowId = String(episode.tvShowId)
    watchedEpisodeCountsByTvShowId[tvShowId] = (watchedEpisodeCountsByTvShowId[tvShowId] ?? 0) + 1
  }

  const tvShowIds = new Set(
    watchHistory.watchedEpisodes.map(episode => episode.tvShowId),
  )
  const tvShows = await Promise.all(
    [...tvShowIds].map(id => tmdb.tvShows.details(id)),
  )

  return {
    signedIn: true,
    tvShows,
    watchedEpisodeCountsByTvShowId,
  }
})

export type WatchedTvShowsResponse = Awaited<ReturnType<typeof handler>>

export default handler
