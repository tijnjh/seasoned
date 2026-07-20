import { IonAvatar, IonButtons, IonContent, IonHeader, IonItem, IonList, IonPage, IonSearchbar, IonToolbar } from '@ionic/react'
import { createFileRoute, createLink } from '@tanstack/react-router'
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

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="end">
            <AuthButton />
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
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
          {watchedTvShows.tvShows.map(tvShow => (
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
            </RouterItem>
          ))}
        </IonList>
      </IonContent>

    </IonPage>
  )
}
