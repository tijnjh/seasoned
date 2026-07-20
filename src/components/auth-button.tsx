import { IonActionSheet, IonButton, IonIcon, IonSpinner } from '@ionic/react'
import { logInOutline, logOutOutline, personCircleOutline } from 'ionicons/icons'
import { useState } from 'react'
import { useHistory } from 'react-router'
import { authClient } from '../lib/auth-client'

export function AuthButton() {
  const [isAccountSheetOpen, setIsAccountSheetOpen] = useState(false)
  const { data: session, isPending } = authClient.useSession()
  const history = useHistory()

  async function signOut() {
    setIsAccountSheetOpen(false)
    await authClient.signOut()
    history.replace(history.location)
  }

  if (isPending) {
    return (
      <IonButton
        fill="clear"
        disabled
        aria-label="Loading account"
      >
        <IonSpinner name="crescent" />
      </IonButton>
    )
  }

  if (!session) {
    return (
      <IonButton
        fill="clear"
        title="Sign in"
        aria-label="Sign in"
        onClick={() =>
          authClient.signIn.social({
            provider: 'google',
            callbackURL: '/',
          })}
      >
        <IonIcon slot="icon-only" icon={logInOutline} aria-hidden="true" />
      </IonButton>
    )
  }

  return (
    <>
      <IonButton
        fill="clear"
        title={session.user.name}
        aria-label="Open account menu"
        onClick={() => setIsAccountSheetOpen(true)}
      >
        <IonIcon
          slot="icon-only"
          icon={personCircleOutline}
          aria-hidden="true"
        />
      </IonButton>

      <IonActionSheet
        isOpen={isAccountSheetOpen}
        header={session.user.name}
        subHeader={session.user.email}
        onDidDismiss={() => setIsAccountSheetOpen(false)}
        buttons={[
          {
            text: 'Log out',
            role: 'destructive',
            icon: logOutOutline,
            handler: () => {
              void signOut()
            },
          },
        ]}
      />
    </>
  )
}
