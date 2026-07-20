import { IonContent, IonHeader, IonItem, IonList, IonPage, IonTitle, IonToolbar } from '@ionic/react'
import { createFileRoute, Outlet, useRouter } from '@tanstack/react-router'
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
  const router = useRouter()

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
            <IonItem
              key={season.id}
              routerLink={router.buildLocation({
                to: '/tv-show/$id/$season',
                params: {
                  id,
                  season: season.season_number,
                },
              }).href}
            >
              {season.season_number || season.name}
            </IonItem>
          ))}
        </IonList>

        <Outlet />
      </IonContent>
    </IonPage>
  )
}
