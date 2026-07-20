import { createServerFn } from '@tanstack/react-start'
import * as v from 'valibot'
import { tmdb } from './tmdb'
import { getTrackerStorage, readTracker } from './tracker.server'

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

export const getWatchedEpisodes = createServerFn()
  .validator(
    v.object({
      tvShowId: v.number(),
      seasonId: v.number(),
    }),
  )
  .handler(async ({ data: { tvShowId, seasonId } }) => {
    const storage = await getTrackerStorage()

    if (!storage)
      return { signedIn: false, episodeIds: [] }

    const tracker = await readTracker(storage)
    const episodeIds = tracker.watchedEpisodes
      .filter(episode =>
        episode.tvShowId === tvShowId && episode.seasonId === seasonId,
      )
      .map(episode => episode.episodeId)

    return { signedIn: true, episodeIds }
  })

export const toggleWatchedEpisode = createServerFn({ method: 'POST' })
  .validator(v.object({
    tvShowId: v.number(),
    seasonId: v.number(),
    episodeId: v.number(),
  }))
  .handler(async ({ data }) => {
    const storage = await getTrackerStorage()

    if (!storage) {
      throw new Error('You must be signed in to track watched episodes.')
    }
    const tracker = await readTracker(storage)
    const existingIndex = tracker.watchedEpisodes.findIndex(episode =>
      episode.tvShowId === data.tvShowId
      && episode.seasonId === data.seasonId
      && episode.episodeId === data.episodeId,
    )
    const watched = existingIndex === -1

    if (watched)
      tracker.watchedEpisodes.push(data)
    else
      tracker.watchedEpisodes.splice(existingIndex, 1)

    await storage.write(tracker)

    const episodeIds = tracker.watchedEpisodes
      .filter(episode =>
        episode.tvShowId === data.tvShowId
        && episode.seasonId === data.seasonId,
      )
      .map(episode => episode.episodeId)

    return { signedIn: true, episodeIds }
  })
