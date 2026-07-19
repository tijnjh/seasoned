import process from 'node:process'
import { TMDB } from 'tmdb-ts'

export const tmdb = new TMDB(
  process.env.TMDB_ACCESS_TOKEN!,
)

export function getSrcFromPath(path: string) {
  return `https://image.tmdb.org/t/p/w300${path}`
}
