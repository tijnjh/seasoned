import { IonAvatar, IonBackButton, IonButtons, IonContent, IonHeader, IonItem, IonList, IonPage, IonSpinner, IonTitle, IonToolbar } from '@ionic/react'
import { useQuery } from '@tanstack/react-query'
import { useLocation } from 'react-router'
import { Searchbar } from '#components/searchbar'
import { search } from '#lib/api'
import { getSrcFromPath } from '#lib/utils'

export function SearchPage() {
  const location = useLocation()

  const urlSearchParams = new URLSearchParams(location.search)

  const resultsQuery = useQuery({
    queryKey: ['search-results', urlSearchParams.get('q') ?? ''],
    queryFn: async () => search(urlSearchParams.get('q') ?? ''),
  })

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" text="Episcoped" />
          </IonButtons>

          <IonTitle>Search results</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>

        <Searchbar initialValue={urlSearchParams.get('q') ?? undefined} />

        {resultsQuery.isLoading
          ? (
              <IonSpinner className="my-8 w-full" />
            )
          : (
              <IonList>
                {resultsQuery.data?.results.map(result => (
                  <IonItem
                    routerLink={`/tv-show/${result.id}`}
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
            ) }

      </IonContent>
    </IonPage>
  )
}
