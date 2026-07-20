import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react'
import { IonReactRouter } from '@ionic/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Route } from 'react-router'
import { HomePage } from './pages/HomePage.tsx'

import { SearchPage } from './pages/SearchPage.tsx'
import { SeasonDetailPage } from './pages/SeasonDetailPage.tsx'
import { TvShowDetailPage } from './pages/TvShowDetailPage.tsx'
import '@ionic/react/css/core.css'
import '@ionic/react/css/normalize.css'
import '@ionic/react/css/structure.css'
import '@ionic/react/css/typography.css'
import '@ionic/react/css/palettes/dark.system.css'

const queryClient = new QueryClient()
setupIonicReact({ mode: 'ios' })

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <IonApp>
        <IonReactRouter>
          <IonRouterOutlet>
            <Route exact path="/" component={HomePage} />
            <Route exact path="/search" component={SearchPage} />
            <Route exact path="/tv-show/:tvShowId" component={TvShowDetailPage} />
            <Route exact path="/tv-show/:tvShowId/:seasonNumber" component={SeasonDetailPage} />
          </IonRouterOutlet>
        </IonReactRouter>
      </IonApp>
    </QueryClientProvider>
  )
}
