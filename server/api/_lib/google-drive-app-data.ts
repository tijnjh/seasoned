import type { drive_v3 } from '@googleapis/drive'
import type { ShowHistory, WatchHistory } from '../../../src/lib/watch-history'
import { parseShowHistory } from '../../../src/lib/watch-history'
import { tmdb } from './tmdb'

// Serializes account writes within one server process, including imports.
// Multi-instance deployments need a shared account-scoped lock.
const writes = new Map<string, Promise<unknown>>()
export async function withHistoryLock<T>(userId: string, action: () => Promise<T>): Promise<T> {
  const previous = writes.get(userId) ?? Promise.resolve()
  const current = previous.catch(() => {}).then(action)
  writes.set(userId, current)
  try {
    return await current
  }
  finally {
    if (writes.get(userId) === current)
      writes.delete(userId)
  }
}

export async function listAppDataFiles(googleDrive: drive_v3.Drive, q: string) {
  const files: drive_v3.Schema$File[] = []
  let pageToken: string | undefined
  do {
    const result = await googleDrive.files.list({
      spaces: 'appDataFolder',
      q: `trashed = false and (${q})`,
      fields: 'nextPageToken,files(id,name,appProperties)',
      pageSize: 1000,
      pageToken,
    })
    files.push(...result.data.files ?? [])
    pageToken = result.data.nextPageToken ?? undefined
  } while (pageToken)
  return files
}

export function createGoogleDriveAppDataStore(googleDrive: drive_v3.Drive, userId: string) {
  const showFiles = new Map<number, drive_v3.Schema$File | undefined>()
  async function findShow(tvShowId: number) {
    if (showFiles.has(tvShowId))
      return showFiles.get(tvShowId)
    const files = await listAppDataFiles(googleDrive, `name = 'show-${tvShowId}.json'`)
    if (files.length > 1)
      throw new Error(`Multiple history files found for show ${tvShowId}.`)
    showFiles.set(tvShowId, files[0])
    return files[0]
  }

  async function readShow(tvShowId: number): Promise<ShowHistory> {
    const file = await findShow(tvShowId)
    if (!file)
      return { version: 2, seasons: {} }
    const result = await googleDrive.files.get({ fileId: file.id!, alt: 'media' }, { responseType: 'json' })
    // Invalid data is an error, never an empty history that a later save can overwrite.
    return parseShowHistory(result.data)
  }

  async function writeShow(tvShowId: number, value: ShowHistory) {
    const show = parseShowHistory(value)
    const file = await findShow(tvShowId)
    const details = await tmdb.tvShows.details(tvShowId)
    const specials = new Set(details.seasons.filter(s => s.season_number === 0).map(s => String(s.id)))
    const count = Object.entries(show.seasons).reduce((sum, [id, episodes]) => sum + (specials.has(id) ? 0 : episodes.length), 0)
    const total = Object.values(show.seasons).reduce((sum, episodes) => sum + episodes.length, 0)
    const requestBody = { appProperties: { kind: 'seasoned-show-v2', tvShowId: String(tvShowId), watchedCount: String(count), totalCount: String(total) } }
    const media = { mimeType: 'application/json', body: JSON.stringify(show) }
    if (file) {
      await googleDrive.files.update({ fileId: file.id!, requestBody, media })
    }
    else {
      const result = await googleDrive.files.create({ requestBody: { ...requestBody, name: `show-${tvShowId}.json`, parents: ['appDataFolder'] }, media, fields: 'id' })
      showFiles.set(tvShowId, { id: result.data.id })
    }
  }

  async function listShows() {
    const files = await listAppDataFiles(googleDrive, 'appProperties has { key=\'kind\' and value=\'seasoned-show-v2\' }')
    return files.map(file => ({
      tvShowId: Number(file.appProperties!.tvShowId),
      watchedCount: Number(file.appProperties!.watchedCount),
      totalCount: Number(file.appProperties!.totalCount),
    }))
  }

  async function updateShow(tvShowId: number, update: (show: ShowHistory) => void) {
    return withHistoryLock(userId, async () => {
      showFiles.delete(tvShowId)
      const show = await readShow(tvShowId)
      update(show)
      await writeShow(tvShowId, show)
      return show
    })
  }

  async function read(): Promise<WatchHistory> {
    const shows: WatchHistory['shows'] = {}
    for (const { tvShowId } of await listShows())
      shows[tvShowId] = await readShow(tvShowId)
    return { version: 2, shows }
  }

  async function write(history: WatchHistory) {
    return withHistoryLock(userId, async () => {
      const existing = await listShows()
      for (const [id, show] of Object.entries(history.shows))
        await writeShow(Number(id), show)
      for (const { tvShowId } of existing) {
        if (!history.shows[tvShowId])
          await writeShow(tvShowId, { version: 2, seasons: {} })
      }
    })
  }

  return { readShow, writeShow, updateShow, listShows, read, write }
}
