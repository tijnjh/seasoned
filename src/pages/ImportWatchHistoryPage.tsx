import { IonAlert, IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonPage, IonSpinner, IonText, IonTextarea, IonTitle, IonToast, IonToolbar } from '@ionic/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { documentOutline } from 'ionicons/icons'
import { useRef, useState } from 'react'
import { importWatchHistory } from '#lib/api'
import { parseWatchHistory } from '#lib/watch-history'

export function ImportWatchHistoryPage() {
  const [json, setJson] = useState('')
  const [error, setError] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()
  const importMutation = useMutation({
    mutationFn: async () => importWatchHistory(parseWatchHistory(JSON.parse(json))),
    onSuccess: async () => {
      setError('')
      setShowSuccess(true)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['watch-history'] }),
        queryClient.invalidateQueries({ queryKey: ['watched-tv-shows'] }),
        queryClient.invalidateQueries({ queryKey: ['watchedEpisodes'] }),
        queryClient.invalidateQueries({ queryKey: ['watchedEpisodeCounts'] }),
      ])
    },
    onError: (cause) => {
      setError(cause instanceof SyntaxError
        ? 'This is not valid JSON.'
        : cause instanceof Error && cause.message.includes('watchedEpisodes')
          ? 'The JSON must contain a watchedEpisodes array with numeric TV show, season, and episode IDs.'
          : cause instanceof Error && cause.message.includes('duplicates')
            ? 'The watch history contains duplicate episodes.'
            : 'Could not import the watch history. Make sure you are signed in and try again.')
    },
  })

  async function selectFile(file?: File) {
    if (!file)
      return

    try {
      const text = await file.text()
      parseWatchHistory(JSON.parse(text))
      setJson(text)
      setError('')
    }
    catch (cause) {
      setError(cause instanceof SyntaxError
        ? 'This file is not valid JSON.'
        : 'This file is not a valid Seasoned watch history.')
    }
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/settings" />
          </IonButtons>
          <IonTitle>Import Watch History</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent color="light">
        <IonText color="medium" className="block px-4">
          <p>Importing replaces your current watch history.</p>
        </IonText>

        <IonList inset>
          <IonItem button detail={false} onClick={() => fileInputRef.current?.click()}>
            <IonIcon slot="start" icon={documentOutline} color="primary" />
            <IonLabel>
              <h2>Select JSON File</h2>
              <p>Choose a Seasoned watch history export</p>
            </IonLabel>
            <input
              ref={fileInputRef}
              hidden
              type="file"
              accept=".json,application/json"
              onChange={event => void selectFile(event.target.files?.[0])}
            />
          </IonItem>
        </IonList>

        <IonList inset>
          <IonItem>
            <IonTextarea
              label="Or paste JSON"
              labelPlacement="stacked"
              autoGrow
              rows={10}
              value={json}
              placeholder={'{\n  "watchedEpisodes": []\n}'}
              onIonInput={(event) => {
                setJson(event.detail.value ?? '')
                setError('')
              }}
            />
          </IonItem>
        </IonList>

        <IonButton
          className="mx-4"
          expand="block"
          disabled={!json.trim() || importMutation.isPending}
          onClick={() => importMutation.mutate()}
        >
          {importMutation.isPending && <IonSpinner slot="start" />}
          {importMutation.isPending ? 'Importing…' : 'Import Watch History'}
        </IonButton>

        <IonAlert
          isOpen={Boolean(error)}
          header="Import Failed"
          message={error}
          buttons={['OK']}
          onDidDismiss={() => setError('')}
        />
        <IonToast
          isOpen={showSuccess}
          message="Watch history imported"
          color="success"
          duration={2200}
          position="bottom"
          onDidDismiss={() => setShowSuccess(false)}
        />
      </IonContent>
    </IonPage>
  )
}
