import type { EventHandlerRequest, H3Event } from 'nitro/h3'
import process from 'node:process'
import { deleteCookie, getCookie, setCookie } from 'nitro/h3'
import { isProtonSessionId } from './proton-cli'

const SESSION_COOKIE = 'seasoned-proton-session'

export function getProtonSessionId(event: H3Event<EventHandlerRequest>) {
  const sessionId = getCookie(event, SESSION_COOKIE)
  return isProtonSessionId(sessionId) ? sessionId : undefined
}

export function setProtonSessionId(event: H3Event<EventHandlerRequest>, sessionId: string) {
  setCookie(event, SESSION_COOKIE, sessionId, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })
}

export function clearProtonSessionId(event: H3Event<EventHandlerRequest>) {
  deleteCookie(event, SESSION_COOKIE, { path: '/' })
}
