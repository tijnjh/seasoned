import { createFileRoute, Link, Outlet } from '@tanstack/react-router'
import { getTvShow } from '#lib/server-functions'

export const Route = createFileRoute('/tv-show/$id')({
  params: {
    parse: ({ id }) => ({ id: Number(id) }),
    stringify: ({ id }) => ({ id: String(id) }),
  },

  loader: async ({ params }) => {
    const tvShowDetails = await getTvShow({ data: { id: params.id } })
    return { tvShowDetails }
  },

  component: RouteComponent,
})

function RouteComponent() {
  const { tvShowDetails } = Route.useLoaderData()
  const { id } = Route.useParams()

  return (
    <div>
      {/* <h1>{tvShowDetails.name}</h1> */}

      <nav className="flex flex-wrap gap-2">
        {tvShowDetails.seasons.map(season => (
          <Link
            key={season.id}
            to="/tv-show/$id/$season"
            className="shrink-0"
            activeProps={{ className: 'bg-blue-400' }}
            params={{
              id,
              season: season.season_number,
            }}
          >
            {season.season_number || season.name}
          </Link>
        ))}
      </nav>

      <Outlet />
    </div>
  )
}
