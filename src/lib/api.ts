import type { MarkSeasonWatchedResponse } from '../../server/api/mark-season-watched.post'
import type { SearchResponse } from '../../server/api/search.get'
import type { ToggleWatchedEpisodeResponse } from '../../server/api/toggle-watched-episode.post'
import type { TvSeasonResponse } from '../../server/api/tv-season.get'
import type { TvShowResponse } from '../../server/api/tv-show.get'
import type { UnmarkSeasonWatchedResponse } from '../../server/api/unmark-season-watched.post'
import type { WatchedEpisodeCountsResponse } from '../../server/api/watched-episode-counts.get'
import type { WatchedEpisodesResponse } from '../../server/api/watched-episodes.get'
import type { WatchedTvShowsResponse } from '../../server/api/watched-tv-shows.get'
import { up } from 'up-fetch'

const $fetch = up(fetch, () => ({
  baseUrl: '/api',
}))

export async function search(q: string) {
  return await $fetch<SearchResponse>('/search', {
    params: { q },
  })
}

export async function getWatchedTvShows() {
  return await $fetch<WatchedTvShowsResponse>('/watched-tv-shows')
}

export async function getTvShow(tvShowId: number) {
  return await $fetch<TvShowResponse>('/tv-show', {
    params: { tvShowId },
  })
}

export async function getWatchedEpisodeCounts({ tvShowId }: { tvShowId: number }) {
  return await $fetch<WatchedEpisodeCountsResponse>('/watched-episode-counts', {
    params: { tvShowId },
  })
}

export async function getWatchedEpisodes({
  tvShowId,
  seasonId,
}: {
  tvShowId: number
  seasonId: number
}) {
  return await $fetch<WatchedEpisodesResponse>('/watched-episodes', {
    params: { tvShowId, seasonId },
  })
}

export async function getTvSeason({
  tvShowId,
  seasonNumber,
}: {
  tvShowId: number
  seasonNumber: number
}) {
  return await $fetch<TvSeasonResponse>('/tv-season', {
    params: { tvShowId, seasonNumber },
  })
}

export async function toggleWatchedEpisode({
  tvShowId,
  seasonId,
  episodeId,
}: {
  tvShowId: number
  seasonId: number
  episodeId: number
}) {
  return await $fetch<ToggleWatchedEpisodeResponse>('/toggle-watched-episode', {
    method: 'POST',
    params: { tvShowId, seasonId, episodeId },
  })
}

export async function markSeasonWatched({
  tvShowId,
  seasonId,
  seasonNumber,
}: {
  tvShowId: number
  seasonId: number
  seasonNumber: number
}) {
  return await $fetch<MarkSeasonWatchedResponse>('/mark-season-watched', {
    method: 'POST',
    params: { tvShowId, seasonId, seasonNumber },
  })
}

export async function unmarkSeasonWatched({
  tvShowId,
  seasonId,
}: {
  tvShowId: number
  seasonId: number
}) {
  return await $fetch<UnmarkSeasonWatchedResponse>('/unmark-season-watched', {
    method: 'POST',
    params: { tvShowId, seasonId },
  })
}
