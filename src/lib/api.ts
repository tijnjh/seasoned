import type { SearchResponse } from '../../server/api/search.get'
import type { WatchedTvShowsResponse } from '../../server/api/watched-tv-shows.get'
import { up } from 'up-fetch'

const $fetch = up(fetch, () => ({
  baseUrl: '/api',
}))

export function search(q: string) {
  return $fetch<SearchResponse>('/search', {
    params: { q },
  })
}

export function getWatchedTvShows() {
  return $fetch<WatchedTvShowsResponse>('/watched-tv-shows')
}
