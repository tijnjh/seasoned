import { IonButtons, IonContent, IonHeader, IonList, IonPage, IonSpinner, IonTitle, IonToolbar } from '@ionic/react'
import { useQuery } from '@tanstack/react-query'
import { useLocation } from 'react-router'
import { AuthButton } from '#components/auth-button'
import { Searchbar } from '#components/searchbar'
import { TvShowListing } from '#components/tv-show-listing'
import { search } from '#lib/api'

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
          <IonTitle>Search</IonTitle>

          <IonButtons slot="end">
            <AuthButton />
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">
              Search
            </IonTitle>
          </IonToolbar>
        </IonHeader>

        <Searchbar initialValue={urlSearchParams.get('q') ?? undefined} />

        {resultsQuery.isLoading
          ? (
              <IonSpinner className="my-8 w-full" />
            )
          : (
              <IonList>
                {resultsQuery.data?.results.map(result => (
                  <TvShowListing key={result.id} tvShow={result} />
                ))}
              </IonList>
            )}
      </IonContent>
    </IonPage>
  )
}
