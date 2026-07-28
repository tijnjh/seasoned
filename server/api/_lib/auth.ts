// src/lib/auth.ts

import process from 'node:process'
import { betterAuth } from 'better-auth'

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      scope: [
        'openid',
        'email',
        'profile',
        'https://www.googleapis.com/auth/drive.appdata',
      ],
      accessType: 'offline',
      prompt: 'consent',
    },
  },
})
