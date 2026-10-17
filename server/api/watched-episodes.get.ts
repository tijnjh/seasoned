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
    return { signedIn: false, episodeIds: [] }
  }

  const show = await historyStore.readShow(params.tvShowId)
  const episodeIds = show.seasons[params.seasonId] ?? []

  return {
    signedIn: true,
    episodeIds,
  }
})

export type WatchedEpisodesResponse = Awaited<ReturnType<typeof handler>>

export default handler
