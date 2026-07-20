import { Form } from '@base-ui/react'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { AuthButton } from '#components/auth-button'
import { Input } from '#components/input'

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  const [searchQuery, setSearchQuery] = useState<string | undefined>(undefined)

  const navigate = Route.useNavigate()

  return (
    <>
      <AuthButton />

      <Form
        onFormSubmit={() => {
          const q = searchQuery?.trim()

          if (!q)
            return

          navigate({
            to: '/search',
            search: { q },
          })
        }}
      >
        <Input
          value={searchQuery}
          onValueChange={setSearchQuery}
          placeholder="search"
        />
      </Form>
    </>
  )
}
