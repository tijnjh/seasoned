import { defineEventHandler } from 'nitro/h3'
import * as v from 'valibot'
import { getSafeQuery } from './_lib/utils'
import { getWatchHistoryStore } from './_lib/watch-history'

const handler = defineEventHandler(async (event) => {
  const params = getSafeQuery(event, v.object({
    tvShowId: v.pipe(v.string(), v.toNumber()),
  }))

  const historyStore = await getWatchHistoryStore(event)

  if (!historyStore) {
    return { signedIn: false, countsBySeasonId: {} }
  }

  const show = await historyStore.readShow(params.tvShowId)
  const countsBySeasonId = Object.fromEntries(Object.entries(show.seasons).map(([id, episodes]) => [id, episodes.length]))

  return { signedIn: true, countsBySeasonId }
})

export type WatchedEpisodeCountsResponse = Awaited<ReturnType<typeof handler>>

export default handler
