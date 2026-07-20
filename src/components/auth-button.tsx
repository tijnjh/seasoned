import { IonButton, IonSpinner } from '@ionic/react'
import { authClient } from '#lib/auth-client'

export function AuthButton() {
  const { data: session, isPending } = authClient.useSession()

  if (isPending)
    return <IonSpinner />

  if (!session) {
    return (
      <IonButton
        onClick={() =>
          authClient.signIn.social({
            provider: 'google',
            callbackURL: '/',
          })}
      >
        Continue with Google
      </IonButton>
    )
  }

  return (
    <IonButton
      onClick={() => authClient.signOut()}
    >
      {session.user.name}
      {' '}
      - sign out?
    </IonButton>
  )
}
