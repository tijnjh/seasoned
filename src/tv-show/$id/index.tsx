import { createFileRoute, Link } from '@tanstack/react-router'
import { getTvShow } from '#lib/server-functions'

export const Route = createFileRoute('/tv-show/$id/')({
  params: {
    parse: ({ id }) => ({ id: Number(id) }),
    stringify: ({ id }) => ({ id: String(id) }),
  },

  loader: async ({ params: { id } }) => {
    const tvShowDetails = await getTvShow({ data: { id } })
    return { tvShowDetails }
  },

  component: RouteComponent,
})

function RouteComponent() {
  const { tvShowDetails } = Route.useLoaderData()
  const { id } = Route.useParams()

  return (
    <ul>
      {tvShowDetails.seasons.map(season => (
        <li key={season.id}>
          <Link
            to="/tv-show/$id/$season"
            params={{
              id,
              season: season.season_number,
            }}
          >
            {season.name}
          </Link>
        </li>
      ))}
    </ul>
  )
}
