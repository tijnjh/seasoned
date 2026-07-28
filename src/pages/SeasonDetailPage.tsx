import type { RouteComponentProps } from 'react-router'
import { IonActionSheet, IonBackButton, IonButton, IonButtons, IonCheckbox, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonLoading, IonPage, IonSpinner, IonTitle, IonToolbar } from '@ionic/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ellipsisHorizontal } from 'ionicons/icons'
import { getTvSeason, getTvShow, getWatchedEpisodes, markSeasonWatched, toggleWatchedEpisode, unmarkSeasonWatched } from '#lib/api'
import { checkIfFutureDate, formatDate, seasonLabelByNumber } from '#lib/utils'

export function SeasonDetailPage({ match }: RouteComponentProps<{ tvShowId: string, seasonNumber: string }>) {
  const tvShowId = Number(match.params.tvShowId)
  const seasonNumber = Number(match.params.seasonNumber)

  const queryClient = useQueryClient()

  const tvShowQuery = useQuery({
    queryKey: ['tv-show', tvShowId],
    queryFn: async () => await getTvShow(tvShowId),
  })

  const tvSeasonQuery = useQuery({
    queryKey: ['tv-season', tvShowId, seasonNumber],
    queryFn: async () => await getTvSeason({ tvShowId, seasonNumber }),

  })

  const seasonId = tvSeasonQuery.data?.id

  const watchedEpisodesQueryKey = ['watchedEpisodes', tvShowId, seasonNumber] as const

  const watchedEpisodesQuery = useQuery({
    queryKey: watchedEpisodesQueryKey,
    enabled: seasonId !== undefined,
    queryFn: () => getWatchedEpisodes({
      tvShowId,
      seasonId: seasonId!,
    }),
    staleTime: Infinity,
  })

  const toggleEpisodeMutation = useMutation({
    mutationFn: async (episodeId: number) => {
      return await toggleWatchedEpisode({
        tvShowId,
        seasonId: tvSeasonQuery.data!.id,
        episodeId,
      })
    },

    onSuccess: (data) => {
      queryClient.setQueryData(watchedEpisodesQueryKey, data)
      void queryClient.invalidateQueries({
        queryKey: ['watchedEpisodeCounts', tvShowId],
      })
    },
  })

  const seasonWatchedMutation = useMutation({
    mutationFn: async (watched: boolean) => {
      if (!watched) {
        return await unmarkSeasonWatched({
          tvShowId,
          seasonId: tvSeasonQuery.data!.id,
        })
      }

      return await markSeasonWatched({
        tvShowId,
        seasonId: tvSeasonQuery.data!.id,
        seasonNumber: tvSeasonQuery.data!.season_number,
      })
    },

    onSuccess: (data) => {
      queryClient.setQueryData(watchedEpisodesQueryKey, data)
      void queryClient.invalidateQueries({
        queryKey: ['watchedEpisodeCounts', tvShowId],
      })
    },
  })

  const watchedEpisodeIds = new Set(watchedEpisodesQuery.data?.episodeIds)
  const watchedEpisodeCount = tvSeasonQuery.data?.episodes.filter(episode => watchedEpisodeIds.has(episode.id)).length
  const allEpisodesWatched = (tvSeasonQuery.data?.episodes.length ?? 0) > 0 && watchedEpisodeCount === tvSeasonQuery.data?.episodes.length

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton
              text={tvShowQuery.data?.name}
              defaultHref={`/tv-show/${tvShowId}`}
            />
          </IonButtons>

          <IonTitle>
            {seasonLabelByNumber(tvSeasonQuery.data?.season_number)}
          </IonTitle>

          <IonButtons slot="end">
            <IonButton id="open-season-action-sheet">
              <IonIcon icon={ellipsisHorizontal} />
            </IonButton>
            <IonActionSheet
              trigger="open-season-action-sheet"
              buttons={[
                allEpisodesWatched
                  ? {
                      text: 'Mark all unwatched',
                      handler: () => seasonWatchedMutation.mutate(false),
                    }
                  : {
                      text: 'Mark all watched',
                      handler: () => seasonWatchedMutation.mutate(true),
                    },
                {
                  text: 'Cancel',
                  role: 'cancel',
                },
              ]}
            >
            </IonActionSheet>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonLoading
        isOpen={seasonWatchedMutation.isPending}
      />

      <IonContent>
        {tvSeasonQuery.isLoading
          ? <IonSpinner className="my-8 w-full" />
          : (
              <>
                {(toggleEpisodeMutation.isError || seasonWatchedMutation.isError) && (
                  <p role="alert">Could not save your watch history. Please try again.</p>
                )}

                <IonList>
                  {tvSeasonQuery.data?.episodes.map(episode => (
                    <IonItem key={episode.id}>
                      {watchedEpisodesQuery.isLoading || (toggleEpisodeMutation.isPending && toggleEpisodeMutation.variables === episode.id)
                        ? <IonSpinner slot="start" className="w-5.5" />
                        : (
                            <IonCheckbox
                              slot="start"
                              checked={watchedEpisodeIds.has(episode.id)}
                              onIonChange={() => toggleEpisodeMutation.mutate(episode.id)}
                              disabled={checkIfFutureDate(episode.air_date) || toggleEpisodeMutation.isPending}
                            />
                          )}
                      <span className="truncate">{`${episode.episode_number}. ${episode.name}`}</span>

                      <IonLabel>
                        <p className="shrink-0 truncate text-right">{formatDate(episode.air_date)}</p>
                      </IonLabel>

                    </IonItem>
                  ))}
                </IonList>
              </>
            )}
      </IonContent>
    </IonPage>
  )
}
