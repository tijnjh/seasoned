import { createServerFn } from '@tanstack/react-start'
import * as v from 'valibot'
import { tmdb } from './tmdb'
import { getWatchHistoryStore, readWatchHistory } from './watch-history.server'

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
    const historyStore = await getWatchHistoryStore()

    if (!historyStore)
      return { signedIn: false, episodeIds: [] }

    const watchHistory = await readWatchHistory(historyStore)
    const episodeIds = watchHistory.watchedEpisodes
      .filter(episode =>
        episode.tvShowId === tvShowId && episode.seasonId === seasonId,
      )
      .map(episode => episode.episodeId)

    return { signedIn: true, episodeIds }
  })

export const getWatchedEpisodeCounts = createServerFn()
  .validator(v.object({ tvShowId: v.number() }))
  .handler(async ({ data: { tvShowId } }) => {
    const historyStore = await getWatchHistoryStore()

    if (!historyStore)
      return { signedIn: false, countsBySeasonId: {} as Record<string, number> }

    const watchHistory = await readWatchHistory(historyStore)
    const countsBySeasonId: Record<string, number> = {}

    for (const episode of watchHistory.watchedEpisodes) {
      if (episode.tvShowId !== tvShowId)
        continue

      const seasonId = String(episode.seasonId)
      countsBySeasonId[seasonId] = (countsBySeasonId[seasonId] ?? 0) + 1
    }

    return { signedIn: true, countsBySeasonId }
  })

export const getWatchedTvShows = createServerFn()
  .handler(async () => {
    const historyStore = await getWatchHistoryStore()

    if (!historyStore) {
      return {
        signedIn: false,
        tvShows: [],
        watchedEpisodeCountsByTvShowId: {} as Record<string, number>,
      }
    }

    const watchHistory = await readWatchHistory(historyStore)
    const watchedEpisodeCountsByTvShowId: Record<string, number> = {}

    for (const episode of watchHistory.watchedEpisodes) {
      const tvShowId = String(episode.tvShowId)
      watchedEpisodeCountsByTvShowId[tvShowId]
        = (watchedEpisodeCountsByTvShowId[tvShowId] ?? 0) + 1
    }

    const tvShowIds = new Set(
      watchHistory.watchedEpisodes.map(episode => episode.tvShowId),
    )
    const tvShows = await Promise.all(
      [...tvShowIds].map(id => tmdb.tvShows.details(id)),
    )

    return { signedIn: true, tvShows, watchedEpisodeCountsByTvShowId }
  })

export const markSeasonWatched = createServerFn({ method: 'POST' })
  .validator(v.object({
    tvShowId: v.number(),
    seasonId: v.number(),
    seasonNumber: v.number(),
  }))
  .handler(async ({ data }) => {
    const historyStore = await getWatchHistoryStore()

    if (!historyStore) {
      throw new Error('You must be signed in to save watched episodes.')
    }

    const season = await tmdb.tvSeasons.details({
      tvShowID: data.tvShowId,
      seasonNumber: data.seasonNumber,
    })

    if (season.id !== data.seasonId) {
      throw new Error('The requested season could not be verified.')
    }

    const watchHistory = await readWatchHistory(historyStore)
    const otherEpisodes = watchHistory.watchedEpisodes.filter(episode =>
      episode.tvShowId !== data.tvShowId || episode.seasonId !== data.seasonId,
    )
    const watchedEpisodes = season.episodes.map(episode => ({
      tvShowId: data.tvShowId,
      seasonId: data.seasonId,
      episodeId: episode.id,
    }))

    watchHistory.watchedEpisodes = [...otherEpisodes, ...watchedEpisodes]
    await historyStore.write(watchHistory)

    return {
      signedIn: true,
      episodeIds: watchedEpisodes.map(episode => episode.episodeId),
    }
  })

export const unmarkSeasonWatched = createServerFn({ method: 'POST' })
  .validator(v.object({
    tvShowId: v.number(),
    seasonId: v.number(),
  }))
  .handler(async ({ data }) => {
    const historyStore = await getWatchHistoryStore()

    if (!historyStore) {
      throw new Error('You must be signed in to save watched episodes.')
    }

    const watchHistory = await readWatchHistory(historyStore)
    watchHistory.watchedEpisodes = watchHistory.watchedEpisodes.filter(episode =>
      episode.tvShowId !== data.tvShowId || episode.seasonId !== data.seasonId,
    )
    await historyStore.write(watchHistory)

    return { signedIn: true, episodeIds: [] }
  })

export const toggleWatchedEpisode = createServerFn({ method: 'POST' })
  .validator(v.object({
    tvShowId: v.number(),
    seasonId: v.number(),
    episodeId: v.number(),
  }))
  .handler(async ({ data }) => {
    const historyStore = await getWatchHistoryStore()

    if (!historyStore) {
      throw new Error('You must be signed in to save watched episodes.')
    }
    const watchHistory = await readWatchHistory(historyStore)
    const existingIndex = watchHistory.watchedEpisodes.findIndex(episode =>
      episode.tvShowId === data.tvShowId
      && episode.seasonId === data.seasonId
      && episode.episodeId === data.episodeId,
    )
    const watched = existingIndex === -1

    if (watched)
      watchHistory.watchedEpisodes.push(data)
    else
      watchHistory.watchedEpisodes.splice(existingIndex, 1)

    await historyStore.write(watchHistory)

    const episodeIds = watchHistory.watchedEpisodes
      .filter(episode =>
        episode.tvShowId === data.tvShowId
        && episode.seasonId === data.seasonId,
      )
      .map(episode => episode.episodeId)

    return { signedIn: true, episodeIds }
  })
