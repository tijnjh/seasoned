import { IonApp, IonIcon, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs, setupIonicReact } from '@ionic/react'
import { IonReactRouter } from '@ionic/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { homeOutline, searchOutline, settingsOutline } from 'ionicons/icons'
import { Route } from 'react-router'
import { ExportWatchHistoryPage } from './pages/ExportWatchHistoryPage.tsx'
import { HomePage } from './pages/HomePage.tsx'
import { ImportWatchHistoryPage } from './pages/ImportWatchHistoryPage.tsx'
import { SearchPage } from './pages/SearchPage.tsx'
import { SeasonDetailPage } from './pages/SeasonDetailPage.tsx'
import { SettingsPage } from './pages/SettingsPage.tsx'
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
          <IonTabs>
            <IonRouterOutlet>
              <Route exact path="/" component={HomePage} />
              <Route exact path="/search" component={SearchPage} />
              <Route exact path="/settings" component={SettingsPage} />
              <Route exact path="/settings/import" component={ImportWatchHistoryPage} />
              <Route exact path="/settings/export" component={ExportWatchHistoryPage} />
              <Route exact path="/tv-show/:tvShowId" component={TvShowDetailPage} />
              <Route exact path="/tv-show/:tvShowId/:seasonNumber" component={SeasonDetailPage} />
            </IonRouterOutlet>

            <IonTabBar slot="bottom">
              <IonTabButton tab="home" href="/">
                <IonIcon icon={homeOutline} />
                <IonLabel>Home</IonLabel>
              </IonTabButton>

              <IonTabButton tab="search" href="/search">
                <IonIcon icon={searchOutline} />
                <IonLabel>Search</IonLabel>
              </IonTabButton>

              <IonTabButton tab="settings" href="/settings">
                <IonIcon icon={settingsOutline} />
                <IonLabel>Settings</IonLabel>
              </IonTabButton>
            </IonTabBar>
          </IonTabs>
        </IonReactRouter>
      </IonApp>
    </QueryClientProvider>
  )
}
