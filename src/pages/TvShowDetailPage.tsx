import type { RouteComponentProps } from 'react-router'
import { IonBackButton, IonBadge, IonButtons, IonContent, IonHeader, IonItem, IonList, IonPage, IonSpinner, IonTitle, IonToolbar } from '@ionic/react'
import { useQuery } from '@tanstack/react-query'
import { getTvShow, getWatchedEpisodeCounts } from '#lib/api'

export function TvShowDetailPage({ match }: RouteComponentProps<{ tvShowId: string }>) {
  const tvShowId = Number(match.params.tvShowId)

  const { data: tvShow } = useQuery({
    queryKey: ['tv-show', tvShowId],
    queryFn: async () => await getTvShow(tvShowId),
  })

  const { data: watchedEpisodeCounts, isLoading } = useQuery({
    queryKey: ['watchedEpisodeCounts', tvShowId],
    queryFn: () => getWatchedEpisodeCounts({ tvShowId }),
    staleTime: Infinity,
  })

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" text="Episcoped" />
          </IonButtons>

          <IonTitle>{tvShow?.name}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {isLoading
          ? <IonSpinner className="my-8 w-full" />
          : (
              <IonList>
                {tvShow?.seasons.map((season) => {
                  const watchedCount = watchedEpisodeCounts?.countsBySeasonId[String(season.id)] ?? 0
                  const allWatched = season.episode_count > 0 && watchedCount >= season.episode_count
                  const badgeColor = allWatched ? 'success' : watchedCount > 0 ? 'warning' : 'medium'

                  return (
                    <IonItem
                      key={season.id}
                      routerLink={`/tv-show/${tvShowId}/${season.season_number}`}
                    >
                      {season.season_number || season.name}
                      <IonBadge
                        slot="end"
                        color={badgeColor}
                        aria-label={`${watchedCount} of ${season.episode_count} episodes watched`}
                      >
                        {watchedCount}
                        /
                        {season.episode_count}
                      </IonBadge>
                    </IonItem>
                  )
                })}
              </IonList>
            )}
      </IonContent>
    </IonPage>
  )
}
