import { IonActionSheet, IonButton, IonIcon, IonSpinner } from '@ionic/react'
import { logInOutline, logOutOutline, personCircleOutline } from 'ionicons/icons'
import { useEffect, useState } from 'react'
import { useHistory } from 'react-router'
import { getProtonAuthStatus, logoutProton, startProtonAuth } from '../lib/api'

interface ProtonAuthStatus {
  signedIn: boolean
  pending: boolean
  error?: string
}

export function AuthButton() {
  const [isAccountSheetOpen, setIsAccountSheetOpen] = useState(false)
  const [status, setStatus] = useState<ProtonAuthStatus>()
  const history = useHistory()

  useEffect(() => {
    let cancelled = false

    async function refresh() {
      const nextStatus = await getProtonAuthStatus()

      if (!cancelled) {
        setStatus(nextStatus)

        if (status?.pending && nextStatus.signedIn)
          history.replace(history.location)
      }
    }

    if (status?.pending) {
      const interval = window.setInterval(() => void refresh(), 2_000)
      return () => {
        cancelled = true
        window.clearInterval(interval)
      }
    }

    void refresh()

    return () => {
      cancelled = true
    }
  }, [history, status?.pending])

  async function signIn() {
    const popup = window.open('about:blank', '_blank')

    if (popup)
      popup.opener = null

    try {
      setStatus({ signedIn: false, pending: true })
      const { signInUrl } = await startProtonAuth()
      setStatus({ signedIn: false, pending: true })

      if (popup)
        popup.location.href = signInUrl
      else
        window.location.href = signInUrl
    }
    catch (error) {
      popup?.close()
      setStatus({
        signedIn: false,
        pending: false,
        error: error instanceof Error ? error.message : 'Could not start Proton Drive login.',
      })
    }
  }

  async function signOut() {
    setIsAccountSheetOpen(false)
    await logoutProton()
    setStatus({ signedIn: false, pending: false })
    history.replace(history.location)
  }

  if (!status || status.pending) {
    return (
      <IonButton
        fill="clear"
        disabled
        aria-label={status?.pending ? 'Waiting for Proton Drive login' : 'Loading account'}
      >
        <IonSpinner name="crescent" />
      </IonButton>
    )
  }

  if (!status.signedIn) {
    return (
      <IonButton
        fill="clear"
        title={status.error || 'Sign in with Proton Drive'}
        aria-label="Sign in with Proton Drive"
        onClick={() => void signIn()}
      >
        <IonIcon slot="icon-only" icon={logInOutline} aria-hidden="true" />
      </IonButton>
    )
  }

  return (
    <>
      <IonButton
        fill="clear"
        title="Proton Drive"
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
        header="Proton Drive"
        subHeader="Watch history is stored in /my-files/watch-history.json"
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
          { text: 'Cancel', role: 'cancel' },
        ]}
      />
    </>
  )
}
