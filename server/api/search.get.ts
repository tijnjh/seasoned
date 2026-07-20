import { defineEventHandler } from 'nitro/h3'
import * as v from 'valibot'
import { tmdb } from './_lib/tmdb'
import { getSafeQuery } from './_lib/utils'

const handler = defineEventHandler(async (event) => {
  const params = getSafeQuery(event, v.object({
    q: v.string(),
  }))

  return await tmdb.search.tvShows({ query: params.q })
})

export type SearchResponse = Awaited<ReturnType<typeof handler>>

export default handler
