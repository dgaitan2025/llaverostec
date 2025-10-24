import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

export default defineNuxtConfig({
  ssr: true,
  css: [
    'vuetify/styles',
    '@mdi/font/css/materialdesignicons.css'
  ],
  compatibilityDate: '2025-09-03',

  app: {
    baseURL: '/',          // 🔹 asegura rutas correctas para _nuxt/
    buildAssetsDir: '_nuxt/', // 🔹 carpeta donde se guardan los assets
  },

  build: {
    transpile: ['vuetify']
  },

  nitro: {
    preset: 'node-server', // 🔹 genera servidor Node listo para producción
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
