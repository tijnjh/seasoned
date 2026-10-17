import { defineEventHandler } from 'nitro/h3'
import * as v from 'valibot'
import { getSafeQuery } from './_lib/utils'
import { getWatchHistoryStore } from './_lib/watch-history'

const handler = defineEventHandler(async (event) => {
  const params = getSafeQuery(event, v.object({
    tvShowId: v.pipe(v.string(), v.toNumber()),
    seasonId: v.pipe(v.string(), v.toNumber()),
    episodeId: v.pipe(v.string(), v.toNumber()),
    watched: v.picklist(['true', 'false']),
  }))

  const historyStore = await getWatchHistoryStore(event)

  if (!historyStore) {
    throw new Error('You must be signed in to save watched episodes.')
  }
  const show = await historyStore.updateShow(params.tvShowId, (show) => {
    const ids = new Set(show.seasons[params.seasonId] ?? [])
    if (params.watched === 'true')
      ids.add(params.episodeId)
    else
      ids.delete(params.episodeId)
    show.seasons[params.seasonId] = [...ids].sort((a, b) => a - b)
  })
  const episodeIds = show.seasons[params.seasonId]

  return { signedIn: true, episodeIds }
})

export type SetWatchedEpisodeResponse = Awaited<ReturnType<typeof handler>>

export default handler
