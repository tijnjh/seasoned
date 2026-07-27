import type { TvShowDetails } from 'tmdb-ts'
import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonLabel, IonList, IonListHeader, IonPage, IonSearchbar, IonSpinner, IonTitle, IonToolbar } from '@ionic/react'
import { useQuery } from '@tanstack/react-query'
import { filterCircle, filterCircleOutline } from 'ionicons/icons'
import { useMemo, useState } from 'react'
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

  const [displayMode, setDisplayMode] = useState<'bucketed' | 'alphabetical'>('bucketed')

  const tvShowBuckets = useMemo(() => {
    const buckets = {
      unfinished: [] as TvShowDetails[],
      upToDate: [] as TvShowDetails[],
      finished: [] as TvShowDetails[],
    }

    for (const tvShow of sortedTvShows) {
      if (tvShow.status === 'Ended') {
        buckets.finished.push(tvShow)
        continue
      }

      const watchedEpisodeCount = watchedTvShows?.watchedEpisodeCountsByTvShowId[String(tvShow.id)] ?? 0
      const totalEpisodeCount = tvShow.seasons.reduce(
        (total, season) => total + (season.season_number === 0 ? 0 : season.episode_count),
        0,
      )

      const allWatched = totalEpisodeCount > 0 && watchedEpisodeCount >= totalEpisodeCount

      if (allWatched) {
        buckets.upToDate.push(tvShow)
        continue
      }

      if (watchedEpisodeCount > 0) {
        buckets.unfinished.push(tvShow)
        continue
      }
    }

    return buckets
  }, [sortedTvShows, watchedTvShows])

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton
              fill="clear"
              title="Sign in"
              aria-label="Sign in"
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
          onIonInput={event => setFilterString(event.detail.value!)}
        />

        {isLoading
          ? <IonSpinner className="my-8 w-full" />
          : (
              <>

                {filterString || displayMode === 'alphabetical'
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
