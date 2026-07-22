import { defineEventHandler } from 'nitro/h3'
import { getProtonSessionId } from '../_lib/proton-auth'
import { getProtonLoginStatus } from '../_lib/proton-cli'

const handler = defineEventHandler(async (event) => {
  return await getProtonLoginStatus(getProtonSessionId(event))
})

export type ProtonAuthStatusResponse = Awaited<ReturnType<typeof handler>>

export default handler
