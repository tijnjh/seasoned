import { defineEventHandler } from 'nitro/h3'
import { tmdb } from './_lib/tmdb'
import { getWatchHistoryStore, readWatchHistory } from './_lib/watch-history'

const handler = defineEventHandler(async (event) => {
  const historyStore = await getWatchHistoryStore(event)

  if (!historyStore) {
    return {
      signedIn: false,
      tvShows: [],
      watchedEpisodeCountsByTvShowId: {},
    }
  }

  const watchHistory = await readWatchHistory(historyStore)
  const tvShowIds = new Set(
    watchHistory.watchedEpisodes.map(episode => episode.tvShowId),
  )
  const tvShows = await Promise.all(
    [...tvShowIds].map(id => tmdb.tvShows.details(id)),
  )
  const specialSeasonIds = new Set(
    tvShows.flatMap(tvShow =>
      tvShow.seasons
        .filter(season => season.season_number === 0)
        .map(season => season.id),
    ),
  )
  const watchedEpisodeCountsByTvShowId: Record<string, number> = {}

  for (const episode of watchHistory.watchedEpisodes) {
    if (specialSeasonIds.has(episode.seasonId))
      continue

    const tvShowId = String(episode.tvShowId)
    watchedEpisodeCountsByTvShowId[tvShowId] = (watchedEpisodeCountsByTvShowId[tvShowId] ?? 0) + 1
  }

  return {
    signedIn: true,
    tvShows,
    watchedEpisodeCountsByTvShowId,
  }
})

export type WatchedTvShowsResponse = Awaited<ReturnType<typeof handler>>

export default handler
