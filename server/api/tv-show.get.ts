import { defineEventHandler } from 'nitro/h3'
import * as v from 'valibot'
import { tmdb } from './_lib/tmdb'
import { getSafeQuery } from './_lib/utils'

const handler = defineEventHandler(async (event) => {
  const params = getSafeQuery(event, v.object({
    tvShowId: v.pipe(v.string(), v.toNumber()),
  }))

  return await tmdb.tvShows.details(params.tvShowId)
})

export type TvShowResponse = Awaited<ReturnType<typeof handler>>

export default handler
