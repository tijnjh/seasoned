import { authClient } from '#lib/auth-client'
import { Button } from './button'

export function AuthButton() {
  const { data: session, isPending } = authClient.useSession()

  if (isPending)
    return null

  if (!session) {
    return (
      <Button
        type="button"
        onClick={() =>
          authClient.signIn.social({
            provider: 'google',
            callbackURL: '/',
          })}
      >
        Continue with Google
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-4">
      <span>{session.user.name}</span>

      <Button
        type="button"
        onClick={() => authClient.signOut()}
      >
        Sign out
      </Button>
    </div>
  )
}
