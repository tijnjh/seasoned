import { createError, defineEventHandler, readBody } from 'nitro/h3'
import { parseWatchHistory } from '../../src/lib/watch-history'
import { getWatchHistoryStore } from './_lib/watch-history'

const handler = defineEventHandler(async (event) => {
  const historyStore = await getWatchHistoryStore(event)

  if (!historyStore) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Sign in to import your watch history.',
    })
  }

  let watchHistory

  try {
    watchHistory = parseWatchHistory(await readBody(event))
  }
  catch {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid watch history file.',
    })
  }

  await historyStore.write(watchHistory)

  return watchHistory
})

export type ImportWatchHistoryResponse = Awaited<ReturnType<typeof handler>>

export default handler
