import { defineEventHandler } from 'nitro/h3'
import * as v from 'valibot'
import { tmdb } from './_lib/tmdb'
import { getSafeQuery } from './_lib/utils'
import { getWatchHistoryStore } from './_lib/watch-history'

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

  const episodeIds = season.episodes.map(episode => episode.id)
  await historyStore.updateShow(params.tvShowId, (show) => {
    show.seasons[params.seasonId] = episodeIds
  })

  return {
    signedIn: true,
    episodeIds,
  }
})

export type MarkSeasonWatchedResponse = Awaited<ReturnType<typeof handler>>

export default handler
