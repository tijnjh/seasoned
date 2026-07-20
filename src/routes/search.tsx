import { IonAvatar, IonContent, IonItem, IonList, IonPage } from '@ionic/react'
import { createFileRoute, useRouter } from '@tanstack/react-router'
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

function RouteComponent() {
  const { results } = Route.useLoaderData()

  const router = useRouter()

  return (
    <IonPage>
      <IonContent>
        <IonList>
          {results.map(result => (
            <IonItem
              routerLink={router.buildLocation({
                to: '/tv-show/$id',
                params: { id: result.id },
              }).href}
              key={result.id}
            >
              {result.poster_path && (
                <IonAvatar slot="start">
                  <img src={getSrcFromPath(result.poster_path)} />
                </IonAvatar>
              )}

              {result.name}
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  )
}
