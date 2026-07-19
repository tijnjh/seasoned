import { createFileRoute } from '@tanstack/react-router'
import { getTvSeason } from '#lib/server-functions'

export const Route = createFileRoute('/tv-show/$id/$season')({
  params: {
    parse: ({ season }) => ({ season: Number(season) }),
    stringify: ({ season }) => ({ season: String(season) }),
  },

  loader: async ({ params }) => {
    const tvSeason = getTvSeason({
      data: {
        tvShowID: Number(params.id),
        seasonNumber: Number(params.season),
      },
    })
    return { tvSeason }
  },

  component: RouteComponent,
})

function RouteComponent() {
  const { } = Route.useLoaderData()

  return <div>Hello "/tv-show/$id/$season"!</div>
}
