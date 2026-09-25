import { IonBackButton, IonButtons, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonNote, IonPage, IonSpinner, IonTitle, IonToolbar } from '@ionic/react'
import { useQuery } from '@tanstack/react-query'
import { downloadOutline } from 'ionicons/icons'
import { getWatchHistory } from '#lib/api'

export function ExportWatchHistoryPage() {
  const watchHistoryQuery = useQuery({
    queryKey: ['watch-history'],
    queryFn: getWatchHistory,
    retry: false,
  })
  const json = watchHistoryQuery.data
    ? JSON.stringify(watchHistoryQuery.data, null, 2)
    : ''

  function downloadWatchHistory() {
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'seasoned-watch-history.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/settings" />
          </IonButtons>
          <IonTitle>Export Watch History</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent color="light">
        {watchHistoryQuery.isLoading && <IonSpinner className="my-8 w-full" />}

        {watchHistoryQuery.isError && (
          <IonNote color="danger" className="block px-4 text-center">
            <p>Sign in to export your watch history.</p>
          </IonNote>
        )}

        {json && (
          <>
            <IonList inset>
              <IonItem button detail={false} onClick={downloadWatchHistory}>
                <IonIcon slot="start" icon={downloadOutline} color="primary" />
                <IonLabel>Download Watch History</IonLabel>
              </IonItem>
            </IonList>

            <div className="mx-4 overflow-x-auto rounded-xl bg-(--elevated) p-4">
              <pre className="m-0 text-sm whitespace-pre-wrap">{json}</pre>
            </div>
          </>
        )}
      </IonContent>
    </IonPage>
  )
}
