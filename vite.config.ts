import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
    nitro(),
  ],
  build: {
    rolldownOptions: {
      treeshake: {
        moduleSideEffects: [
          // Ionic's standalone elements register only when defineCustomElement is
          // called. Drop unused elements; preserve runtime and CSS side effects.
          { test: /\/node_modules\/@ionic\/core\/components\/ion-[^/]+\.js$/, sideEffects: false },
        ],
      },
    },
  },
  server: {
    port: 5173,
  },
})
