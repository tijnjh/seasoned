import { authClient } from '#lib/auth-client'

export function AuthButton() {
  const { data: session, isPending } = authClient.useSession()

  if (isPending)
    return null

  if (!session) {
    return (
      <button
        type="button"
        onClick={() =>
          authClient.signIn.social({
            provider: 'google',
            callbackURL: '/',
          })}
      >
        Continue with Google
      </button>
    )
  }

  return (
    <div>
      <span>{session.user.name}</span>

      <button
        type="button"
        onClick={() => authClient.signOut()}
      >
        Sign out
      </button>
    </div>
  )
}
