import type { TV, TvShowDetails } from 'tmdb-ts'
import type { WatchedTvShowsResponse } from '../../server/api/watched-tv-shows.get'
import { IonAvatar, IonBadge, IonItem, IonLabel } from '@ionic/react'
import { getSrcFromPath } from '#lib/utils'

export function TvShowListing({
  tvShow,
  watchedTvShows,
}: {
  tvShow: TV | TvShowDetails
  watchedTvShows?: WatchedTvShowsResponse
}) {
  return (
    <IonItem
      key={tvShow.id}
      routerLink={`/tv-show/${tvShow.id}`}
    >
      {tvShow.poster_path && (
        <IonAvatar slot="start">
          <img className="aspect-3/4 rounded-sm" src={getSrcFromPath(tvShow.poster_path)} />
        </IonAvatar>
      )}

      <IonLabel className="truncate">{tvShow.name}</IonLabel>

      <TvShowListingBadge tvShow={tvShow as TvShowDetails} watchedTvShows={watchedTvShows} />
    </IonItem>
  )
}

function TvShowListingBadge({
  tvShow,
  watchedTvShows,
}: {
  tvShow: TvShowDetails
  watchedTvShows?: WatchedTvShowsResponse
}) {
  if (!watchedTvShows)
    return

  const watchedEpisodeCount = watchedTvShows?.watchedEpisodeCountsByTvShowId[String(tvShow.id)] ?? 0
  const totalEpisodeCount = tvShow.seasons.reduce(
    (total, season) => total + (season.season_number === 0 ? 0 : season.episode_count),
    0,
  )
  const allWatched = totalEpisodeCount > 0 && watchedEpisodeCount >= totalEpisodeCount

  const badgeColor = (() => {
    if (tvShow.status === 'Ended')
      return 'tertiary'
    if (allWatched)
      return 'success'
    if (watchedEpisodeCount > 0)
      return 'warning'
    return 'medium'
  })()

  return (
    <IonBadge
      slot="end"
      color={badgeColor}
      aria-label={`${watchedEpisodeCount} of ${totalEpisodeCount} episodes watched`}
    >
      {watchedEpisodeCount}
      /
      {totalEpisodeCount}
    </IonBadge>
  )
}
