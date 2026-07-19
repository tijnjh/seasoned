// src/lib/tracker-storage.ts

import type { drive_v3 } from '@googleapis/drive'

const FILE_NAME = 'tracker.json'

export interface TrackerStorage<T> {
  read: () => Promise<T | null>
  write: (value: T) => Promise<void>
}

export function createGoogleDriveStorage<T>(
  drive: drive_v3.Drive,
): TrackerStorage<T> {
  let fileId: string | undefined

  async function findFile() {
    if (fileId)
      return fileId

    const result = await drive.files.list({
      spaces: 'appDataFolder',
      q: `name = '${FILE_NAME}'`,
      fields: 'files(id)',
    })

    fileId = result.data.files?.[0]?.id ?? undefined
    return fileId
  }

  return {
    async read() {
      const id = await findFile()

      if (!id)
        return null

      const result = await drive.files.get(
        {
          fileId: id,
          alt: 'media',
        },
        {
          responseType: 'json',
        },
      )

      return result.data as T
    },

    async write(value) {
      const id = await findFile()
      const body = JSON.stringify(value)

      if (id) {
        await drive.files.update({
          fileId: id,
          media: {
            mimeType: 'application/json',
            body,
          },
        })

        return
      }

      const result = await drive.files.create({
        requestBody: {
          name: FILE_NAME,
          parents: ['appDataFolder'],
        },
        media: {
          mimeType: 'application/json',
          body,
        },
        fields: 'id',
      })

      fileId = result.data.id ?? undefined
    },
  }
}
