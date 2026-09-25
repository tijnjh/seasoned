import { IonSearchbar } from '@ionic/react'
import { useState } from 'react'
import { useHistory } from 'react-router'

export function Searchbar({ initialValue }: { initialValue?: string }) {
  const [query, setQuery] = useState<string | undefined>(initialValue)

  const history = useHistory()

  return (
    <form onSubmit={(e) => {
      e.preventDefault()

      const q = query?.trim()

      if (!q)
        return

      history.push({
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
