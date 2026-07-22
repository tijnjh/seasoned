import { IonButtons, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonPage, IonTitle, IonToolbar } from '@ionic/react'
import { downloadOutline, pushOutline } from 'ionicons/icons'
import { AuthButton } from '#components/auth-button'

export function SettingsPage() {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Settings</IonTitle>
          <IonButtons slot="end">
            <AuthButton />
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent color="light">
        <IonHeader collapse="condense">
          <IonToolbar color="light">
            <IonTitle size="large">Settings</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonList inset>
          <IonItem button detail routerLink="/settings/import">
            <IonIcon slot="start" icon={pushOutline} color="primary" />
            <IonLabel>
              <h2>Import Watch History</h2>
              <p>Restore watched episodes from a JSON file</p>
            </IonLabel>
          </IonItem>

          <IonItem button detail routerLink="/settings/export">
            <IonIcon slot="start" icon={downloadOutline} color="primary" />
            <IonLabel>
              <h2>Export Watch History</h2>
              <p>View or download your watched episodes</p>
            </IonLabel>
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  )
}
