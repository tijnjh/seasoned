import type { TvShowDetails } from 'tmdb-ts'
import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonLabel, IonList, IonListHeader, IonPage, IonSearchbar, IonSpinner, IonTitle, IonToolbar } from '@ionic/react'
import { useQuery } from '@tanstack/react-query'
import { filterCircle, filterCircleOutline } from 'ionicons/icons'
import { useState } from 'react'
import { AuthButton } from '#components/auth-button'
import { TvShowListing } from '#components/tv-show-listing'
import { getWatchedTvShows } from '#lib/api'
import { getTvShowProgress } from '#lib/tv-show-progress'

export function HomePage() {
  const { data: watchedTvShows, isLoading } = useQuery({
    queryKey: ['watched-tv-shows'],
    queryFn: async () => getWatchedTvShows(),
  })

  const sortedTvShows = [...(watchedTvShows?.tvShows ?? [])].sort((first, second) =>
    first.name.localeCompare(second.name, undefined, { sensitivity: 'base' }),
  )

  const [filterString, setFilterString] = useState('')
  const searchTerm = filterString.trim().toLowerCase()
  const filteredTvShows = sortedTvShows.filter(tvShow => tvShow.name.toLowerCase().includes(searchTerm))

  const [displayMode, setDisplayMode] = useState<'bucketed' | 'alphabetical'>('bucketed')

  const tvShowBuckets = {
    unfinished: [] as TvShowDetails[],
    upToDate: [] as TvShowDetails[],
    finished: [] as TvShowDetails[],
  }

  for (const tvShow of filteredTvShows) {
    const watchedEpisodeCount = watchedTvShows?.watchedEpisodeCountsByTvShowId[String(tvShow.id)] ?? 0
    const { bucket } = getTvShowProgress(tvShow, watchedEpisodeCount)
    tvShowBuckets[bucket].push(tvShow)
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton
              fill="clear"
              title={displayMode === 'bucketed' ? 'Show alphabetically' : 'Group by progress'}
              aria-label={displayMode === 'bucketed' ? 'Show alphabetically' : 'Group by progress'}
              onClick={() => setDisplayMode(prev => prev === 'bucketed' ? 'alphabetical' : 'bucketed')}
            >
              <IonIcon
                slot="icon-only"
                icon={displayMode === 'alphabetical' ? filterCircleOutline : filterCircle}
                aria-hidden="true"
              />
            </IonButton>
          </IonButtons>

          <IonTitle>Seasoned</IonTitle>

          <IonButtons slot="end">
            <AuthButton />
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">
              Seasoned
            </IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonSearchbar
          debounce={100}
          value={filterString}
          placeholder="Filter tracked shows"
          onIonInput={event => setFilterString(event.detail.value ?? '')}
        />

        {isLoading
          ? <IonSpinner className="my-8 w-full" />
          : (
              <>

                {displayMode === 'alphabetical'
                  ? (
                      <IonList>
                        {filteredTvShows.map(tvShow => (
                          <TvShowListing key={tvShow.id} tvShow={tvShow} watchedTvShows={watchedTvShows} />
                        ))}
                      </IonList>
                    )
                  : (
                      <>
                        <IonList>
                          <IonListHeader>
                            <IonLabel>Unfinished</IonLabel>
                          </IonListHeader>

                          {tvShowBuckets.unfinished.map(tvShow => (
                            <TvShowListing key={tvShow.id} tvShow={tvShow} watchedTvShows={watchedTvShows} />
                          ))}
                        </IonList>

                        <IonList>
                          <IonListHeader>
                            <IonLabel>Up to date</IonLabel>
                          </IonListHeader>

                          {tvShowBuckets.upToDate.map(tvShow => (
                            <TvShowListing key={tvShow.id} tvShow={tvShow} watchedTvShows={watchedTvShows} />
                          ))}
                        </IonList>

                        <IonList>
                          <IonListHeader>
                            <IonLabel>Finished</IonLabel>
                          </IonListHeader>

                          {tvShowBuckets.finished.map(tvShow => (
                            <TvShowListing key={tvShow.id} tvShow={tvShow} watchedTvShows={watchedTvShows} />
                          ))}
                        </IonList>
                      </>
                    )}
              </>
            )}
      </IonContent>
    </IonPage>
  )
}
