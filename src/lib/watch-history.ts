import * as v from 'valibot'

const watchedEpisodeSchema = v.strictObject({
  tvShowId: v.pipe(v.number(), v.safeInteger(), v.minValue(1)),
  seasonId: v.pipe(v.number(), v.safeInteger(), v.minValue(1)),
  episodeId: v.pipe(v.number(), v.safeInteger(), v.minValue(1)),
})

export const watchHistorySchema = v.strictObject({
  watchedEpisodes: v.pipe(
    v.array(watchedEpisodeSchema),
    v.check((episodes) => {
      const keys = episodes.map(episode => `${episode.tvShowId}:${episode.seasonId}:${episode.episodeId}`)
      return new Set(keys).size === keys.length
    }, 'Watched episodes must not contain duplicates.'),
  ),
})

export type WatchHistory = v.InferOutput<typeof watchHistorySchema>

export function parseWatchHistory(value: unknown): WatchHistory {
  const result = v.safeParse(watchHistorySchema, value)

  if (!result.success)
    throw new Error(v.summarize(result.issues))

  return result.output
}
