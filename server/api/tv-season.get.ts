import { defineEventHandler } from 'nitro/h3'
import * as v from 'valibot'
import { tmdb } from './_lib/tmdb'
import { getSafeQuery } from './_lib/utils'

const handler = defineEventHandler(async (event) => {
  const params = getSafeQuery(event, v.object({
    tvShowId: v.pipe(v.string(), v.toNumber()),
    seasonNumber: v.pipe(v.string(), v.toNumber()),
  }))

  return await tmdb.tvSeasons.details({
    tvShowID: params.tvShowId,
    seasonNumber: params.seasonNumber,
  })
})

export type TvSeasonResponse = Awaited<ReturnType<typeof handler>>

export default handler
