import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from '@tanstack/react-router'
import { StrictMode } from 'react'
import stylesCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'color-scheme', content: 'light dark' },
    ],
    links: [
      { rel: 'stylesheet', href: stylesCss },
    ],
  }),

  component: RootComponent,
})

function RootComponent() {
  return (
    <StrictMode>
      <html lang="en">
        <head>
          <HeadContent />
        </head>
        <body>
          <div className="mx-auto flex w-full max-w-xl flex-col gap-4 p-4">
            <Outlet />
          </div>

          <Scripts />
        </body>
      </html>
    </StrictMode>
  )
}
