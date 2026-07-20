import { IonButton } from '@ionic/react'
import { authClient } from '#lib/auth-client'

export function AuthButton() {
  const { data: session, isPending } = authClient.useSession()

  if (isPending)
    return null

  if (!session) {
    return (
      <IonButton
        type="button"
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
    <div className="flex items-center gap-4">
      <span>{session.user.name}</span>

      <IonButton
        type="button"
        onClick={() => authClient.signOut()}
      >
        Sign out
      </IonButton>
    </div>
  )
}
