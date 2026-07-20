import { IonButton, IonIcon } from '@ionic/react'
import { useCanGoBack, useRouter } from '@tanstack/react-router'
import { chevronBack } from 'ionicons/icons'

type RouterBackButtonProps
  = { label: string }
    & (
      | { fallbackTo: '/' }
      | { fallbackTo: '/tv-show/$id', params: { id: number } }
    )

export function RouterBackButton(props: RouterBackButtonProps) {
  const canGoBack = useCanGoBack()
  const router = useRouter()

  function goBack() {
    if (canGoBack) {
      router.history.back()
      return
    }

    if (props.fallbackTo === '/') {
      void router.navigate({ to: '/' })
      return
    }

    void router.navigate({
      to: '/tv-show/$id',
      params: props.params,
    })
  }

  return (
    <IonButton
      type="button"
      fill="clear"
      aria-label={`Back to ${props.label}`}
      onClick={goBack}
    >
      <IonIcon slot="start" icon={chevronBack} aria-hidden="true" />
      {props.label}
    </IonButton>
  )
}
