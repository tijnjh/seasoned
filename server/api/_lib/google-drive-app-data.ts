import type { drive_v3 } from '@googleapis/drive'

const APP_DATA_FILE_NAME = 'watch-history.json'

export interface AppDataStore<T> {
  read: () => Promise<T | null>
  write: (value: T) => Promise<void>
}

export function createGoogleDriveAppDataStore<T>(googleDrive: drive_v3.Drive): AppDataStore<T> {
  let appDataFileId: string | undefined

  async function findAppDataFile() {
    if (appDataFileId)
      return appDataFileId

    const result = await googleDrive.files.list({
      spaces: 'appDataFolder',
      q: `name = '${APP_DATA_FILE_NAME}'`,
      fields: 'files(id)',
    })

    appDataFileId = result.data.files?.[0]?.id ?? undefined

    return appDataFileId
  }

  return {
    async read() {
      const fileId = await findAppDataFile()

      if (!fileId)
        return null

      const result = await googleDrive.files.get(
        {
          fileId,
          alt: 'media',
        },
        {
          responseType: 'json',
        },
      )

      return result.data as T
    },

    async write(value) {
      const fileId = await findAppDataFile()
      const serializedValue = JSON.stringify(value)

      if (fileId) {
        await googleDrive.files.update({
          fileId,
          media: {
            mimeType: 'application/json',
            body: serializedValue,
          },
        })

        return
      }

      const result = await googleDrive.files.create({
        requestBody: {
          name: APP_DATA_FILE_NAME,
          parents: ['appDataFolder'],
        },
        media: {
          mimeType: 'application/json',
          body: serializedValue,
        },
        fields: 'id',
      })

      appDataFileId = result.data.id ?? undefined
    },
  }
}
