import { defineEventHandler } from 'nitro/h3'
import * as v from 'valibot'
import { getSafeQuery } from './_lib/utils'
import { getWatchHistoryStore, readWatchHistory } from './_lib/watch-history'

const handler = defineEventHandler(async (event) => {
  const params = getSafeQuery(event, v.object({
    tvShowId: v.pipe(v.string(), v.toNumber()),
    seasonId: v.pipe(v.string(), v.toNumber()),
    episodeId: v.pipe(v.string(), v.toNumber()),
  }))

  const historyStore = await getWatchHistoryStore(event)

  if (!historyStore) {
    throw new Error('You must be signed in to save watched episodes.')
  }
  const watchHistory = await readWatchHistory(historyStore)
  const existingIndex = watchHistory.watchedEpisodes.findIndex(episode =>
    episode.tvShowId === params.tvShowId
    && episode.seasonId === params.seasonId
    && episode.episodeId === params.episodeId,
  )
  const watched = existingIndex === -1

  if (watched)
    watchHistory.watchedEpisodes.push(params)
  else
    watchHistory.watchedEpisodes.splice(existingIndex, 1)

  await historyStore.write(watchHistory)

  const episodeIds = watchHistory.watchedEpisodes
    .filter(episode =>
      episode.tvShowId === params.tvShowId
      && episode.seasonId === params.seasonId,
    )
    .map(episode => episode.episodeId)

  return { signedIn: true, episodeIds }
})

export type ToggleWatchedEpisodeResponse = Awaited<ReturnType<typeof handler>>

export default handler
