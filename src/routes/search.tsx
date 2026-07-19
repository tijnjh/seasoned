import { createFileRoute, Link } from '@tanstack/react-router'
import * as v from 'valibot'
import { search } from '#lib/server-functions'
import { getSrcFromPath } from '#lib/tmdb'

export const Route = createFileRoute('/search')({

  validateSearch: v.object({ q: v.string() }),

  loaderDeps: ({ search: { q } }) => ({ q }),

  loader: async ({ deps: { q } }) => {
    const result = await search({ data: q })
    return { result }
  },

  component: RouteComponent,
})

function RouteComponent() {
  const { result } = Route.useLoaderData()

  return (
    <div>
      {result.results.map(r => (
        <Link key={r.id} to="/tv-show/$id" params={{ id: r.id }}>
          <img src={getSrcFromPath(r.poster_path)} />
          {r.name}
        </Link>
      ))}
    </div>
  )
}
