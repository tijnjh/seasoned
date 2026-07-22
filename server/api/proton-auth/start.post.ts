import { defineEventHandler } from 'nitro/h3'
import { getProtonSessionId, setProtonSessionId } from '../_lib/proton-auth'
import { beginProtonLogin, createProtonSessionId, deleteProtonSession } from '../_lib/proton-cli'

const handler = defineEventHandler(async (event) => {
  await deleteProtonSession(getProtonSessionId(event))

  const sessionId = createProtonSessionId()
  const signInUrl = await beginProtonLogin(sessionId)
  setProtonSessionId(event, sessionId)

  return { signInUrl }
})

export type ProtonAuthStartResponse = Awaited<ReturnType<typeof handler>>

export default handler
