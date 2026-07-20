import { IonContent, IonHeader, IonPage, IonSearchbar } from '@ionic/react'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { AuthButton } from '#components/auth-button'

export const Route = createFileRoute('/')({
  component: RouteComponent,
  ssr: 'data-only',
})

function RouteComponent() {
  const navigate = Route.useNavigate()

  const [query, setQuery] = useState<string | undefined>(undefined)

  return (
    <IonPage>
      <IonHeader>
        <AuthButton />
      </IonHeader>

      <IonContent>
        <form onSubmit={(e) => {
          e.preventDefault()

          const q = query?.trim()

          if (!q)
            return

          navigate({
            to: '/search',
            search: { q },
          })
        }}
        >
          <IonSearchbar
            onIonInput={e => setQuery(e.detail.value ?? undefined)}
            value={query}
          />
        </form>
      </IonContent>
    </IonPage>
  )
}
