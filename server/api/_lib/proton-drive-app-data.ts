import type { AppDataStore } from './watch-history'
import { readFile, rm, unlink, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { withProtonCliSession } from './proton-cli'

const APP_DATA_FILE_NAME = 'watch-history.json'
const APP_DATA_REMOTE_PATH = `/my-files/${APP_DATA_FILE_NAME}`

interface ProtonDriveNode {
  name?: { ok?: boolean, value?: string }
}

export function createProtonDriveAppDataStore<T>(sessionId: string): AppDataStore<T> {
  return {
    async read() {
      return await withProtonCliSession(sessionId, async ({ directory, run }) => {
        const listing = JSON.parse(
          await run(['filesystem', 'list', '/my-files', '--type', 'file']),
        ) as ProtonDriveNode[]
        const exists = listing.some(node =>
          node.name?.ok === true && node.name.value === APP_DATA_FILE_NAME,
        )

        if (!exists)
          return null

        const downloadDirectory = join(directory, 'download')

        try {
          await run([
            'filesystem',
            'download',
            APP_DATA_REMOTE_PATH,
            downloadDirectory,
            '--file-conflict-strategy',
            'replace',
          ])

          return JSON.parse(
            await readFile(join(downloadDirectory, APP_DATA_FILE_NAME), 'utf8'),
          ) as T
        }
        finally {
          await rm(downloadDirectory, { recursive: true, force: true })
        }
      })
    },

    async write(value) {
      await withProtonCliSession(sessionId, async ({ directory, run }) => {
        const localPath = join(directory, APP_DATA_FILE_NAME)
        await writeFile(localPath, JSON.stringify(value), { mode: 0o600 })

        try {
          await run([
            'filesystem',
            'upload',
            localPath,
            '/my-files',
            '--file-conflict-strategy',
            'merge',
            '--skip-thumbnails',
          ])
        }
        finally {
          await unlink(localPath).catch(() => undefined)
        }
      })
    },
  }
}
