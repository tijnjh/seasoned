import { IonContent, IonHeader, IonList, IonPage, IonTitle, IonToolbar } from '@ionic/react'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { RouterItem } from '#components/router-item'
import { getTvShow } from '#lib/server-functions'

export const Route = createFileRoute('/tv-show/$id')({
  params: {
    parse: ({ id }) => ({ id: Number(id) }),
    stringify: ({ id }) => ({ id: String(id) }),
  },

  ssr: 'data-only',

  loader: async ({ params }) => {
    const tvShow = await getTvShow({ data: { id: params.id } })
    return { tvShow }
  },

  component: RouteComponent,
})

function RouteComponent() {
  const { tvShow } = Route.useLoaderData()
  const { id } = Route.useParams()
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{tvShow.name}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>

        <IonList>
          {tvShow.seasons.map(season => (
            <RouterItem
              key={season.id}
              to="/tv-show/$id/$season"
              params={{ id, season: season.season_number }}
            >
              {season.season_number || season.name}
            </RouterItem>
          ))}
        </IonList>

        <Outlet />
      </IonContent>
    </IonPage>
  )
}
