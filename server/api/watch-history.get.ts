import { createError, defineEventHandler } from 'nitro/h3'
import { getWatchHistoryStore, readWatchHistory } from './_lib/watch-history'

const handler = defineEventHandler(async (event) => {
  const historyStore = await getWatchHistoryStore(event)

  if (!historyStore) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Sign in to export your watch history.',
    })
  }

  return await readWatchHistory(historyStore)
})

export type WatchHistoryResponse = Awaited<ReturnType<typeof handler>>

export default handler
