import process from 'node:process'
import { TMDB } from 'tmdb-ts'

export const tmdb = new TMDB(
  process.env.TMDB_ACCESS_TOKEN!,
)
