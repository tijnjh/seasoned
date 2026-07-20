import { IonAvatar, IonBadge, IonButtons, IonContent, IonHeader, IonList, IonPage, IonSearchbar, IonTitle, IonToolbar } from '@ionic/react'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { AuthButton } from '#components/auth-button'
import { RouterItem } from '#components/router-item'
import { getWatchedTvShows } from '#lib/server-functions'
import { getSrcFromPath } from '#lib/utils'

export const Route = createFileRoute('/')({
  component: RouteComponent,

  ssr: 'data-only',

  loader: async () => {
    const watchedTvShows = await getWatchedTvShows()
    return { watchedTvShows }
  },
})

function RouteComponent() {
  const navigate = Route.useNavigate()

  const [query, setQuery] = useState<string | undefined>(undefined)

  const { watchedTvShows } = Route.useLoaderData()
  const sortedTvShows = [...watchedTvShows.tvShows].sort((first, second) =>
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

        <form onSubmit={(e) => {
          e.preventDefault()

          const q = query?.trim()

          if (!q)
            return

          navigate({
            to: '/search',
            search: { q },
          })
        }}
        >
          <IonSearchbar
            onIonInput={e => setQuery(e.detail.value ?? undefined)}
            value={query}
          />
        </form>

        <IonList>
          {sortedTvShows.map((tvShow) => {
            const watchedEpisodeCount
              = watchedTvShows.watchedEpisodeCountsByTvShowId[String(tvShow.id)] ?? 0
            const totalEpisodeCount = tvShow.seasons.reduce(
              (total, season) => total + season.episode_count,
              0,
            )
            const allWatched = totalEpisodeCount > 0
              && watchedEpisodeCount >= totalEpisodeCount
            const badgeColor = allWatched
              ? 'success'
              : watchedEpisodeCount > 0 ? 'warning' : 'medium'

            return (
              <RouterItem
                to="/tv-show/$id"
                params={{ id: tvShow.id }}
                key={tvShow.id}
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
              </RouterItem>
            )
          })}
        </IonList>
      </IonContent>

    </IonPage>
  )
}
