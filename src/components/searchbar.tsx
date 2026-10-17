import { IonSearchbar } from '@ionic/react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function Searchbar({ initialValue }: { initialValue?: string }) {
  const [query, setQuery] = useState<string | undefined>(initialValue)

  const navigate = useNavigate()

  return (
    <form onSubmit={(e) => {
      e.preventDefault()

      const q = query?.trim()

      if (!q)
        return

      navigate({
        pathname: '/search',
        search: `?q=${encodeURIComponent(q)}`,
      })
    }}
    >
      <IonSearchbar
        onIonInput={e => setQuery(e.detail.value ?? undefined)}
        value={query}
      />
    </form>
  )
}
