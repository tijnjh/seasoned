import { IonAvatar, IonBadge, IonButtons, IonContent, IonHeader, IonItem, IonList, IonPage, IonSearchbar, IonSpinner, IonTitle, IonToolbar } from '@ionic/react'
import { useQuery } from '@tanstack/react-query'
import { AuthButton } from '#components/auth-button'

import { Searchbar } from '#components/searchbar'
import { getWatchedTvShows } from '#lib/api'
import { getSrcFromPath } from '#lib/utils'

export function HomePage() {
  const { data: watchedTvShows, isLoading } = useQuery({
    queryKey: ['watched-tv-shows'],
    queryFn: async () => getWatchedTvShows(),
  })

  const sortedTvShows = [...(watchedTvShows?.tvShows ?? [])].sort((first, second) =>
    first.name.localeCompare(second.name, undefined, { sensitivity: 'base' }),
  )

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="end">
            <AuthButton />
          </IonButtons>
          <IonTitle>Episcoped</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>

        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">
              Episcoped
            </IonTitle>
          </IonToolbar>
        </IonHeader>

        <Searchbar />

        {isLoading && <IonSpinner className="my-8 w-full" />}

        <IonList>
          {sortedTvShows.map((tvShow) => {
            const watchedEpisodeCount = watchedTvShows?.watchedEpisodeCountsByTvShowId[String(tvShow.id)] ?? 0
            const totalEpisodeCount = tvShow.seasons.reduce(
              (total, season) => total + (season.season_number === 0 ? 0 : season.episode_count),
              0,
            )
            const allWatched = totalEpisodeCount > 0
              && watchedEpisodeCount >= totalEpisodeCount
            const badgeColor = allWatched
              ? 'success'
              : watchedEpisodeCount > 0 ? 'warning' : 'medium'

            return (
              <IonItem
                key={tvShow.id}
                routerLink={`/tv-show/${tvShow.id}`}
              >
                {tvShow.poster_path && (
                  <IonAvatar slot="start">
                    <img src={getSrcFromPath(tvShow.poster_path)} />
                  </IonAvatar>
                )}

                {tvShow.name}

                <IonBadge
                  slot="end"
                  color={badgeColor}
                  aria-label={`${watchedEpisodeCount} of ${totalEpisodeCount} episodes watched`}
                >
                  {watchedEpisodeCount}
                  /
                  {totalEpisodeCount}
                </IonBadge>
              </IonItem>
            )
          })}
        </IonList>
      </IonContent>

    </IonPage>
  )
}
