import { IonButtons, IonContent, IonHeader, IonIcon, IonItem, IonList, IonPage, IonTitle, IonToolbar } from '@ionic/react'
import { downloadOutline, pushOutline } from 'ionicons/icons'
import * as icon from 'ionicons/icons'
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

      <IonContent fullscreen color="light">
        <IonHeader collapse="condense">
          <IonToolbar color="light">
            <IonTitle size="large">Settings</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonList inset>
          <IonItem button detail routerLink="/settings/import">
            <IonIcon slot="start" icon={icon.pushOutline} color="primary" />
            Import Watch History
          </IonItem>

          <IonItem button detail routerLink="/settings/export">
            <IonIcon slot="start" icon={icon.downloadOutline} color="primary" />
            Export Watch History
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  )
}
