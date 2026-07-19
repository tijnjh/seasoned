import { createServerFn } from '@tanstack/react-start'
import * as v from 'valibot'
import { tmdb } from './tmdb'

export const search = createServerFn()
  .validator(v.string())
  .handler(async ({ data: query }) => {
    return await tmdb.search.tvShows({ query })
  })

export const getTvShow = createServerFn()
  .validator(v.object({ id: v.number() }))
  .handler(async ({ data: { id } }) => {
    return await tmdb.tvShows.details(id)
  })

export const getTvSeason = createServerFn()
  .validator(
    v.object({
      tvShowID: v.number(),
      seasonNumber: v.number(),
    }),
  )
  .handler(async ({ data: { tvShowID, seasonNumber } }) => {
    return await tmdb.tvSeasons.details({ tvShowID, seasonNumber })
  })

// export const getTvSeasonEpisodes = createServerFn()
//   .validator(v.object({ id: v.number() }))
//   .handler(async ({ data: { id } }) => {
//     return await tmdb.tvSeasons.
//   })
