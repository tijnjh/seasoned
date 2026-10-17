import { defineEventHandler } from 'nitro/h3'
import * as v from 'valibot'
import { getSafeQuery } from './_lib/utils'
import { getWatchHistoryStore } from './_lib/watch-history'

const handler = defineEventHandler(async (event) => {
  const params = getSafeQuery(event, v.object({
    tvShowId: v.pipe(v.string(), v.toNumber()),
    seasonId: v.pipe(v.string(), v.toNumber()),
  }))

  const historyStore = await getWatchHistoryStore(event)

  if (!historyStore) {
    throw new Error('You must be signed in to save watched episodes.')
  }

  await historyStore.updateShow(params.tvShowId, (show) => {
    delete show.seasons[params.seasonId]
  })

  return { signedIn: true, episodeIds: [] }
})

export type UnmarkSeasonWatchedResponse = Awaited<ReturnType<typeof handler>>

export default handler
