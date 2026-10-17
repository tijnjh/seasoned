import { defineEventHandler, HTTPError } from 'nitro/h3'
import { getWatchHistoryStore } from './_lib/watch-history'

const handler = defineEventHandler(async (event) => {
  const historyStore = await getWatchHistoryStore(event)

  if (!historyStore) {
    throw new HTTPError({
      statusCode: 401,
      statusMessage: 'Sign in to export your watch history.',
    })
  }

  return await historyStore.read()
})

export type WatchHistoryResponse = Awaited<ReturnType<typeof handler>>

export default handler
