import type { TvShowDetails } from 'tmdb-ts'

export function getTvShowProgress(tvShow: Pick<TvShowDetails, 'seasons' | 'status'>, watchedEpisodeCount: number) {
  const totalEpisodeCount = tvShow.seasons.reduce(
    (total, season) => total + (season.season_number === 0 ? 0 : season.episode_count),
    0,
  )
  const allWatched = totalEpisodeCount > 0 && watchedEpisodeCount >= totalEpisodeCount
  const hasEnded = tvShow.status === 'Ended' || tvShow.status === 'Canceled'
  const bucket = !allWatched ? 'unfinished' : hasEnded ? 'finished' : 'upToDate'
  const badgeColor = bucket === 'finished' ? 'tertiary' : bucket === 'upToDate' ? 'success' : watchedEpisodeCount > 0 ? 'warning' : 'medium'

  return { totalEpisodeCount, bucket, badgeColor } as const
}
