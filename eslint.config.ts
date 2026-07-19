import antfu from '@antfu/eslint-config'
import tailwindcss from 'eslint-plugin-better-tailwindcss'

export default antfu({
  formatters: true,
  ignores: ['src/routeTree.gen.ts'],
  react: true,
  rules: {
    'react-refresh/only-export-components': 'off',
  },
}).append(tailwindcss.configs.recommended, {
  settings: {
    'better-tailwindcss': {
      entryPoint: 'src/styles.css',
    },
  },
  rules: {
    'better-tailwindcss/enforce-consistent-line-wrapping': 'off',
  },
})
