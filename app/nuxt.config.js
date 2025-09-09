// nuxt.config.js
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

export default defineNuxtConfig({
  css: [
    'vuetify/styles',
    '@mdi/font/css/materialdesignicons.css'
  ],
   compatibilityDate: '2025-09-03',
  build: {
    transpile: ['vuetify']
  },
  vite: {
    ssr: {
      noExternal: ['vuetify']
    },
    plugins: [
      vuetify({ autoImport: true })
    ]
  }
})
