import { createFileRoute } from '@tanstack/react-router'
import { AuthButton } from '#components/auth-button'

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <AuthButton />
      <div>
        Hello "/"!
      </div>
    </>
  )
}
