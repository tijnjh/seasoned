import { defineEventHandler } from 'nitro/h3'
import * as v from 'valibot'
import { getSafeQuery } from './_lib/utils'
import { getWatchHistoryStore, readWatchHistory } from './_lib/watch-history.server'

const handler = defineEventHandler(async (event) => {
  const params = getSafeQuery(event, v.object({
    tvShowId: v.pipe(v.string(), v.toNumber()),
  }))

  const historyStore = await getWatchHistoryStore()

  if (!historyStore) {
    return { signedIn: false, countsBySeasonId: {} }
  }

  const watchHistory = await readWatchHistory(historyStore)
  const countsBySeasonId: Record<string, number> = {}

  for (const episode of watchHistory.watchedEpisodes) {
    if (episode.tvShowId !== params.tvShowId) {
      continue
    }

    const seasonId = String(episode.seasonId)
    countsBySeasonId[seasonId] = (countsBySeasonId[seasonId] ?? 0) + 1
  }

  return { signedIn: true, countsBySeasonId }
})

export type WatchedEpisodeCountsResponse = Awaited<ReturnType<typeof handler>>

export default handler
