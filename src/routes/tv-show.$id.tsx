import { IonBackButton, IonBadge, IonButtons, IonContent, IonHeader, IonList, IonPage, IonTitle, IonToolbar } from '@ionic/react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { RouterItem } from '#components/router-item'
import { getTvShow, getWatchedEpisodeCounts } from '#lib/server-functions'

export const Route = createFileRoute('/tv-show/$id')({
  params: {
    parse: ({ id }) => ({ id: Number(id) }),
    stringify: ({ id }) => ({ id: String(id) }),
  },

  ssr: 'data-only',

  loader: async ({ params }) => {
    const [tvShow, watchedEpisodeCounts] = await Promise.all([
      getTvShow({ data: { id: params.id } }),
      getWatchedEpisodeCounts({ data: { tvShowId: params.id } }),
    ])

    return { tvShow, watchedEpisodeCounts }
  },

  component: RouteComponent,
})

function RouteComponent() {
  const { tvShow, watchedEpisodeCounts } = Route.useLoaderData()
  const { id } = Route.useParams()

  const watchedEpisodeCountsQuery = useQuery({
    queryKey: ['watchedEpisodeCounts', id],
    queryFn: () => getWatchedEpisodeCounts({ data: { tvShowId: id } }),
    initialData: watchedEpisodeCounts,
    staleTime: Infinity,
  })

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" />
          </IonButtons>

          <IonTitle>{tvShow.name}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>

        <IonList>
          {tvShow.seasons.map((season) => {
            const watchedCount = watchedEpisodeCountsQuery
              .data
              .countsBySeasonId[String(season.id)] ?? 0
            const allWatched = season.episode_count > 0
              && watchedCount >= season.episode_count

            return (
              <RouterItem
                key={season.id}
                to="/tv-show/$id/$season"
                params={{ id, season: season.season_number }}
              >
                {season.season_number || season.name}

                <IonBadge
                  slot="end"
                  color={allWatched ? 'success' : 'medium'}
                >
                  {watchedCount}
                  /
                  {season.episode_count}
                </IonBadge>
              </RouterItem>
            )
          })}
        </IonList>

        <Outlet />
      </IonContent>
    </IonPage>
  )
}
