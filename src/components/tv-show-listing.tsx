import type { TV, TvShowDetails } from 'tmdb-ts'
import type { WatchedTvShowsResponse } from '../../server/api/watched-tv-shows.get'
import { IonAvatar, IonBadge, IonItem, IonLabel } from '@ionic/react'
import { getTvShowProgress } from '#lib/tv-show-progress'
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
  const { totalEpisodeCount, badgeColor } = getTvShowProgress(tvShow, watchedEpisodeCount)

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
