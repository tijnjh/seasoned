import { IonAvatar, IonBackButton, IonButtons, IonContent, IonHeader, IonItem, IonList, IonPage, IonTitle, IonToolbar } from '@ionic/react'
import { createFileRoute, createLink } from '@tanstack/react-router'
import * as v from 'valibot'
import { search } from '#lib/server-functions'
import { getSrcFromPath } from '#lib/utils'

export const Route = createFileRoute('/search')({

  validateSearch: v.object({ q: v.string() }),

  loaderDeps: ({ search: { q } }) => ({ q }),

  ssr: 'data-only',

  loader: async ({ deps: { q } }) => {
    const { results } = await search({ data: q })
    return { results }
  },

  component: RouteComponent,
})

const RouterItem = createLink(IonItem)

function RouteComponent() {
  const { results } = Route.useLoaderData()

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" />
          </IonButtons>

          <IonTitle>Search results</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonList>
          {results.map(result => (
            <RouterItem
              to="/tv-show/$id"
              params={{ id: result.id }}
              key={result.id}
            >
              {result.poster_path && (
                <IonAvatar slot="start">
                  <img src={getSrcFromPath(result.poster_path)} />
                </IonAvatar>
              )}

              {result.name}
            </RouterItem>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  )
}
