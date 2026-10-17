import { defineEventHandler } from 'nitro/h3'
import { tmdb } from './_lib/tmdb'
import { getWatchHistoryStore } from './_lib/watch-history'

const handler = defineEventHandler(async (event) => {
  const historyStore = await getWatchHistoryStore(event)

  if (!historyStore) {
    return {
      signedIn: false,
      tvShows: [],
      watchedEpisodeCountsByTvShowId: {},
    }
  }

  const summaries = (await historyStore.listShows()).filter(show => show.totalCount > 0)
  const tvShows = await Promise.all(summaries.map(show => tmdb.tvShows.details(show.tvShowId)))
  const watchedEpisodeCountsByTvShowId = Object.fromEntries(summaries.map(show => [String(show.tvShowId), show.watchedCount]))

  return {
    signedIn: true,
    tvShows,
    watchedEpisodeCountsByTvShowId,
  }
})

export type WatchedTvShowsResponse = Awaited<ReturnType<typeof handler>>

export default handler
