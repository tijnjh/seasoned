import { defineEventHandler } from 'nitro/h3'
import * as v from 'valibot'
import { getSafeQuery } from './_lib/utils'
import { getWatchHistoryStore, readWatchHistory } from './_lib/watch-history.server'

const handler = defineEventHandler(async (event) => {
  const params = getSafeQuery(event, v.object({
    tvShowId: v.pipe(v.string(), v.toNumber()),
    seasonId: v.pipe(v.string(), v.toNumber()),
  }))

  const historyStore = await getWatchHistoryStore()

  if (!historyStore) {
    throw new Error('You must be signed in to save watched episodes.')
  }

  const watchHistory = await readWatchHistory(historyStore)
  watchHistory.watchedEpisodes = watchHistory.watchedEpisodes.filter(episode =>
    episode.tvShowId !== params.tvShowId || episode.seasonId !== params.seasonId,
  )
  await historyStore.write(watchHistory)

  return { signedIn: true, episodeIds: [] }
})

export type UnmarkSeasonWatchedResponse = Awaited<ReturnType<typeof handler>>

export default handler
