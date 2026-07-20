import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { authClient } from '#lib/auth-client'
import { getTvSeason, getWatchedEpisodes, toggleWatchedEpisode } from '#lib/server-functions'

export const Route = createFileRoute('/tv-show/$id/$season')({
  params: {
    parse: ({ season }) => ({ season: Number(season) }),
    stringify: ({ season }) => ({ season: String(season) }),
  },

  loader: async ({ params }) => {
    const tvSeason = await getTvSeason({
      data: {
        tvShowID: params.id,
        seasonNumber: params.season,
      },
    })

    const watchedEpisodes = await getWatchedEpisodes({
      data: {
        tvShowId: params.id,
        seasonId: tvSeason.id,
      },
    })

    return { tvSeason, watchedEpisodes }
  },

  component: RouteComponent,
})

function RouteComponent() {
  const { tvSeason, watchedEpisodes } = Route.useLoaderData()

  const { id, season } = Route.useParams()

  const queryClient = useQueryClient()

  const watchedEpisodesQueryKey = ['watchedEpisodes', id, tvSeason.id] as const

  const watchedEpisodesQuery = useQuery({
    queryKey: watchedEpisodesQueryKey,
    queryFn: () => getWatchedEpisodes({
      data: { tvShowId: id, seasonId: tvSeason.id },
    }),
    initialData: watchedEpisodes,
    staleTime: Infinity,
  })

  const toggleEpisodeMutation = useMutation({
    mutationFn: async (episodeId: number) => {
      return await toggleWatchedEpisode({
        data: { tvShowId: id, seasonId: tvSeason.id, episodeId },
      })
    },

    onSuccess: data => queryClient.setQueryData(watchedEpisodesQueryKey, data),
  })

  const watchedEpisodeIds = new Set(watchedEpisodesQuery.data.episodeIds)

  return (
    <div className="flex flex-col gap-4">
      {!watchedEpisodesQuery.data.signedIn && (
        <div className="flex items-center justify-between gap-4">
          <p>Sign in to track watched episodes.</p>
          <button
            type="button"
            onClick={() => authClient.signIn.social({
              provider: 'google',
              callbackURL: `/tv-show/${id}/${season}`,
            })}
          >
            Continue with Google
          </button>
        </div>
      )}

      {toggleEpisodeMutation.isError && (
        <p role="alert">Could not save this episode. Please try again.</p>
      )}

      {tvSeason.episodes.map(episode => (
        <label key={episode.id} className="flex gap-3">
          {watchedEpisodesQuery.data.signedIn && (
            <input
              checked={watchedEpisodeIds.has(episode.id)}
              disabled={toggleEpisodeMutation.isPending}
              type="checkbox"
              onChange={() => toggleEpisodeMutation.mutate(episode.id)}
            />
          )}

          <span>
            <span className="block font-semibold">
              {episode.episode_number}
              .
              {' '}
              {episode.name}
            </span>
            <span>{episode.overview}</span>
          </span>
        </label>
      ))}
    </div>
  )
}
