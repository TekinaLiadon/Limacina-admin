export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  ssr: false,
  devtools: { enabled: true },
  css: ['~/assets/css/main.scss'],
  runtimeConfig: {
    public: {
      apiBase: '',
    },
  },
  app: {
    head: {
      htmlAttrs: { lang: 'ru' },
      title: 'Limacina',
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/icon.svg' },
      ],
    },
  },
  hooks: {
    'vite:extendConfig'(config, { isClient }) {
      if (!isClient) return
      if (!config.environments) config.environments = {} as any
      if (!config.environments.ssr) {
        ;(config.environments as any).ssr = {
          build: {
            rollupOptions: {
              input: 'virtual:nuxt/spa-mock',
            },
          },
        }
      }
    },
  },
})
