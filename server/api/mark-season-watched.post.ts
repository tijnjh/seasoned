import { defineEventHandler } from 'nitro/h3'
import * as v from 'valibot'
import { tmdb } from './_lib/tmdb'
import { getSafeQuery } from './_lib/utils'
import { getWatchHistoryStore, readWatchHistory } from './_lib/watch-history'

const handler = defineEventHandler(async (event) => {
  const params = getSafeQuery(event, v.object({
    tvShowId: v.pipe(v.string(), v.toNumber()),
    seasonId: v.pipe(v.string(), v.toNumber()),
    seasonNumber: v.pipe(v.string(), v.toNumber()),
  }))

  const historyStore = await getWatchHistoryStore(event)

  if (!historyStore) {
    throw new Error('You must be signed in to save watched episodes.')
  }

  const season = await tmdb.tvSeasons.details({
    tvShowID: params.tvShowId,
    seasonNumber: params.seasonNumber,
  })

  if (season.id !== params.seasonId) {
    throw new Error('The requested season could not be verified.')
  }

  const watchHistory = await readWatchHistory(historyStore)
  const otherEpisodes = watchHistory.watchedEpisodes.filter(episode =>
    episode.tvShowId !== params.tvShowId || episode.seasonId !== params.seasonId,
  )
  const watchedEpisodes = season.episodes.map(episode => ({
    tvShowId: params.tvShowId,
    seasonId: params.seasonId,
    episodeId: episode.id,
  }))

  watchHistory.watchedEpisodes = [...otherEpisodes, ...watchedEpisodes]
  await historyStore.write(watchHistory)

  return {
    signedIn: true,
    episodeIds: watchedEpisodes.map(episode => episode.episodeId),
  }
})

export type MarkSeasonWatchedResponse = Awaited<ReturnType<typeof handler>>

export default handler
