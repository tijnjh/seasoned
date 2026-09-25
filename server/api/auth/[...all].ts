import { defineEventHandler } from 'nitro/h3'
import { auth } from '../_lib/auth'

export default defineEventHandler(event => auth.handler(event.req))
