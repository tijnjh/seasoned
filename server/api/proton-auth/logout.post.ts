import { defineEventHandler } from 'nitro/h3'
import { clearProtonSessionId, getProtonSessionId } from '../_lib/proton-auth'
import { deleteProtonSession } from '../_lib/proton-cli'

const handler = defineEventHandler(async (event) => {
  await deleteProtonSession(getProtonSessionId(event))
  clearProtonSessionId(event)
  return { signedIn: false }
})

export default handler
