import { IonButton, IonButtons, IonContent, IonHeader, IonItem, IonLabel, IonList, IonLoading, IonNote, IonPage, IonTitle, IonToggle, IonToolbar } from '@ionic/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { RouterBackButton } from '#components/router-back-button'
import { authClient } from '#lib/auth-client'
import { getTvSeason, getTvShow, getWatchedEpisodes, markSeasonWatched, toggleWatchedEpisode } from '#lib/server-functions'

export const Route = createFileRoute('/tv-show/$id_/$season')({
  params: {
    parse: ({ id, season }) => ({ id: Number(id), season: Number(season) }),
    stringify: ({ id, season }) => ({ id: String(id), season: String(season) }),
  },

  ssr: 'data-only',

  loader: async ({ params }) => {
    const tvShow = await getTvShow({ data: { id: params.id } })

    const tvSeason = await getTvSeason({
      data: {
        tvShowID: params.id,
        seasonNumber: params.season,
      },
    })

    const watchedEpisodes = await getWatchedEpisodes({
      data: {
        tvShowId: params.id,
        seasonId: tvSeason.id,
      },
    })

    return { tvShow, tvSeason, watchedEpisodes }
  },

  component: RouteComponent,
})

function RouteComponent() {
  const { tvShow, tvSeason, watchedEpisodes } = Route.useLoaderData()

  const { id, season } = Route.useParams()

  const queryClient = useQueryClient()

  const watchedEpisodesQueryKey = ['watchedEpisodes', id, tvSeason.id] as const

  const watchedEpisodesQuery = useQuery({
    queryKey: watchedEpisodesQueryKey,
    queryFn: () => getWatchedEpisodes({
      data: { tvShowId: id, seasonId: tvSeason.id },
    }),
    initialData: watchedEpisodes,
    staleTime: Infinity,
  })

  const toggleEpisodeMutation = useMutation({
    mutationFn: async (episodeId: number) => {
      return await toggleWatchedEpisode({
        data: { tvShowId: id, seasonId: tvSeason.id, episodeId },
      })
    },

    onSuccess: (data) => {
      queryClient.setQueryData(watchedEpisodesQueryKey, data)
      void queryClient.invalidateQueries({
        queryKey: ['watchedEpisodeCounts', id],
      })
    },
  })

  const markSeasonWatchedMutation = useMutation({
    mutationFn: async () => {
      return await markSeasonWatched({
        data: {
          tvShowId: id,
          seasonId: tvSeason.id,
          seasonNumber: tvSeason.season_number,
        },
      })
    },

    onSuccess: (data) => {
      queryClient.setQueryData(watchedEpisodesQueryKey, data)
      void queryClient.invalidateQueries({
        queryKey: ['watchedEpisodeCounts', id],
      })
    },
  })

  const watchedEpisodeIds = new Set(watchedEpisodesQuery.data.episodeIds)
  const watchedEpisodeCount = tvSeason.episodes.filter(episode => watchedEpisodeIds.has(episode.id)).length
  const allEpisodesWatched = tvSeason.episodes.length > 0 && watchedEpisodeCount === tvSeason.episodes.length

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <RouterBackButton
              fallbackTo="/tv-show/$id"
              params={{ id }}
              label={tvShow.name}
            />
          </IonButtons>

          <IonTitle>
            {tvShow.name}
            {' '}
            - season
            {tvSeason.season_number || tvSeason.name}
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonLoading
        isOpen={toggleEpisodeMutation.isPending || markSeasonWatchedMutation.isPending}
      />

      <IonContent>

        {!watchedEpisodesQuery.data.signedIn && (
          <div className="flex items-center justify-between gap-4">
            <p>Sign in to track watched episodes.</p>
            <IonButton
              type="button"
              onClick={() => authClient.signIn.social({
                provider: 'google',
                callbackURL: `/tv-show/${id}/${season}`,
              })}
            >
              Continue with Google
            </IonButton>
          </div>
        )}

        {(toggleEpisodeMutation.isError || markSeasonWatchedMutation.isError) && (
          <p role="alert">Could not save your watch history. Please try again.</p>
        )}

        {watchedEpisodesQuery.data.signedIn && (
          <IonItem lines="full">
            <IonLabel>
              <h2>Season progress</h2>
              <p>
                {watchedEpisodeCount}
                {' '}
                of
                {' '}
                {tvSeason.episodes.length}
                {' '}
                episodes watched
              </p>
            </IonLabel>

            <IonButton
              slot="end"
              type="button"
              color={allEpisodesWatched ? 'success' : 'primary'}
              fill={allEpisodesWatched ? 'solid' : 'outline'}
              onClick={() => markSeasonWatchedMutation.mutate()}
            >
              {markSeasonWatchedMutation.isPending
                ? 'Saving…'
                : allEpisodesWatched
                  ? 'All watched'
                  : 'Mark all watched'}
            </IonButton>
          </IonItem>
        )}

        <IonList>
          {tvSeason.episodes.map(episode => (
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
    </IonPage>
  )
}
