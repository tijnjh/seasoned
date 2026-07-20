import type { RouteComponentProps } from 'react-router'
import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonItem, IonLabel, IonList, IonLoading, IonNote, IonPage, IonSpinner, IonTitle, IonToggle, IonToolbar } from '@ionic/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getTvSeason, getTvShow, getWatchedEpisodes, markSeasonWatched, toggleWatchedEpisode, unmarkSeasonWatched } from '#lib/api'
import { authClient } from '#lib/auth-client'

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

  const watchedEpisodesQueryKey = ['watchedEpisodes', tvShowId, seasonNumber] as const

  const watchedEpisodesQuery = useQuery({
    queryKey: watchedEpisodesQueryKey,
    queryFn: () => getWatchedEpisodes({
      tvShowId,
      seasonId: tvSeasonQuery.data!.id,
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

  const isLoading = [
    tvShowQuery,
    tvSeasonQuery,
    watchedEpisodesQuery,
  ].some(query => query.isLoading)

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
            {tvSeasonQuery.data?.season_number === 0 ? tvSeasonQuery.data?.name : `Season ${tvSeasonQuery.data?.season_number}`}
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonLoading
        isOpen={toggleEpisodeMutation.isPending || seasonWatchedMutation.isPending}
      />

      {isLoading
        ? (
            <IonContent>

              <IonSpinner className="my-8 w-full" />
            </IonContent>
          )
        : (
            <IonContent>
              {!watchedEpisodesQuery.data?.signedIn && (
                <div className="flex items-center justify-between gap-4">
                  <p>Sign in to track watched episodes.</p>
                  <IonButton
                    type="button"
                    onClick={() => authClient.signIn.social({
                      provider: 'google',
                      callbackURL: `/tv-show/${tvShowId}/${seasonNumber}`,
                    })}
                  >
                    Continue with Google
                  </IonButton>
                </div>
              )}

              {(toggleEpisodeMutation.isError || seasonWatchedMutation.isError) && (
                <p role="alert">Could not save your watch history. Please try again.</p>
              )}

              {watchedEpisodesQuery.data?.signedIn && (
                <IonItem lines="full">
                  <IonLabel>
                    <h2>Season progress</h2>
                    <p>
                      {watchedEpisodeCount}
                      {' '}
                      of
                      {' '}
                      {tvSeasonQuery.data?.episodes.length}
                      {' '}
                      episodes watched
                    </p>
                  </IonLabel>

                  <IonButton
                    slot="end"
                    type="button"
                    color={allEpisodesWatched ? 'success' : 'primary'}
                    fill={allEpisodesWatched ? 'solid' : 'outline'}
                    onClick={() => seasonWatchedMutation.mutate(!allEpisodesWatched)}
                  >
                    {seasonWatchedMutation.isPending
                      ? 'Saving…'
                      : allEpisodesWatched
                        ? 'Mark unwatched'
                        : 'Mark all watched'}
                  </IonButton>
                </IonItem>
              )}

              <IonList>
                {tvSeasonQuery.data?.episodes.map(episode => (
                  <IonItem key={episode.id} className="flex gap-3">
                    <IonToggle
                      checked={watchedEpisodeIds.has(episode.id)}
                      onIonChange={() => toggleEpisodeMutation.mutate(episode.id)}
                    >

                      <IonLabel>
                        {`${episode.episode_number}. ${episode.name}`}
                      </IonLabel>

                      <IonNote color="medium">
                        {episode.overview}
                      </IonNote>
                    </IonToggle>
                  </IonItem>
                ))}
              </IonList>
            </IonContent>
          )}
    </IonPage>
  )
}
