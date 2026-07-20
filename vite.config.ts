import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import react from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'
import { defineConfig } from 'vite'

export default defineConfig(({ command }) => ({
  css: {
    lightningcss: {
      exclude: 1048576,
    },
  },
  plugins: [
    tanstackStart(),
    ...(command === 'build' ? [nitro()] : []),
    react(),
    tailwindcss(),
  ],

  ssr: {
    noExternal: [
      '@ionic/react',
      '@ionic/core',
    ],
  },
}))
