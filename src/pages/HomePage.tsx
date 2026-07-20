import { IonButtons, IonContent, IonHeader, IonList, IonPage, IonSearchbar, IonSpinner, IonTitle, IonToolbar } from '@ionic/react'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { AuthButton } from '#components/auth-button'
import { TvShowListing } from '#components/tv-show-listing'
import { getWatchedTvShows } from '#lib/api'

export function HomePage() {
  const { data: watchedTvShows, isLoading } = useQuery({
    queryKey: ['watched-tv-shows'],
    queryFn: async () => getWatchedTvShows(),
  })

  const sortedTvShows = [...(watchedTvShows?.tvShows ?? [])].sort((first, second) =>
    first.name.localeCompare(second.name, undefined, { sensitivity: 'base' }),
  )

  const [filterString, setFilterString] = useState('')
  const filteredTvShows = sortedTvShows.filter(tvShow => tvShow.name.toLowerCase().includes(filterString.toLowerCase()))

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

        <IonSearchbar debounce={100} value={filterString} onIonInput={event => setFilterString(event.detail.value as string)} />

        {isLoading && <IonSpinner className="my-8 w-full" />}

        <IonList>
          {filteredTvShows.map(tvShow => (
            <TvShowListing key={tvShow.id} tvShow={tvShow} watchedTvShows={watchedTvShows} />
          ))}
        </IonList>
      </IonContent>

    </IonPage>
  )
}
