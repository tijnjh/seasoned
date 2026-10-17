import * as v from 'valibot'

const id = v.pipe(v.string(), v.regex(/^[1-9]\d*$/), v.check(value => Number.isSafeInteger(Number(value))))
const episodeIds = v.pipe(
  v.array(v.pipe(v.number(), v.safeInteger(), v.minValue(1))),
  v.check(ids => new Set(ids).size === ids.length, 'Episodes must not contain duplicates.'),
)
export const showHistorySchema = v.strictObject({
  version: v.literal(2),
  seasons: v.record(id, episodeIds),
})
export const watchHistorySchema = v.strictObject({
  version: v.literal(2),
  shows: v.record(id, showHistorySchema),
})
export type ShowHistory = v.InferOutput<typeof showHistorySchema>
export type WatchHistory = v.InferOutput<typeof watchHistorySchema>

export function parseShowHistory(value: unknown): ShowHistory {
  return v.parse(showHistorySchema, value)
}

export function parseWatchHistory(value: unknown): WatchHistory {
  return v.parse(watchHistorySchema, value)
}
