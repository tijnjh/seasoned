import type { RouteComponentProps } from 'react-router'
import type { Season } from 'tmdb-ts/dist/types/tv-shows'
import type { WatchedEpisodeCountsResponse } from '../../server/api/watched-episode-counts.get'
import { IonBackButton, IonBadge, IonButtons, IonContent, IonHeader, IonItem, IonList, IonPage, IonSpinner, IonTitle, IonToolbar } from '@ionic/react'
import { useQuery } from '@tanstack/react-query'
import { getTvShow, getWatchedEpisodeCounts } from '#lib/api'
import { seasonLabelByNumber } from '#lib/utils'

export function TvShowDetailPage({ match }: RouteComponentProps<{ tvShowId: string }>) {
  const tvShowId = Number(match.params.tvShowId)

  const tvShowQuery = useQuery({
    queryKey: ['tv-show', tvShowId],
    queryFn: async () => await getTvShow(tvShowId),
  })

  const watchedEpisodeCountsQuery = useQuery({
    queryKey: ['watchedEpisodeCounts', tvShowId],
    queryFn: () => getWatchedEpisodeCounts({ tvShowId }),
    staleTime: Infinity,
  })

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" />
          </IonButtons>

          <IonTitle>{tvShowQuery.data?.name}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {tvShowQuery.isLoading
          ? <IonSpinner className="my-8 w-full" />
          : (
              <IonList>
                {tvShowQuery.data?.seasons.map(season => (
                  <IonItem
                    key={season.id}
                    routerLink={`/tv-show/${tvShowId}/${season.season_number}`}
                  >
                    {seasonLabelByNumber(season.season_number)}

                    {watchedEpisodeCountsQuery.isLoading
                      ? <IonSpinner slot="end" />
                      : (
                          <SeasonBadge
                            season={season}
                            watchedEpisodeCounts={watchedEpisodeCountsQuery.data!}
                          />
                        )}
                  </IonItem>
                ))}
              </IonList>
            )}
      </IonContent>
    </IonPage>
  )
}

function SeasonBadge({
  season,
  watchedEpisodeCounts,
}: {
  season: Season
  watchedEpisodeCounts: WatchedEpisodeCountsResponse
}) {
  const watchedCount = watchedEpisodeCounts.countsBySeasonId[String(season.id)] ?? 0
  const allWatched = season.episode_count > 0 && watchedCount >= season.episode_count
  const badgeColor = allWatched ? 'success' : watchedCount > 0 ? 'warning' : 'medium'

  return (

    <IonBadge
      slot="end"
      color={badgeColor}
      aria-label={`${watchedCount} of ${season.episode_count} episodes watched`}
    >
      {watchedCount}
      /
      {season.episode_count}
    </IonBadge>
  )
}
