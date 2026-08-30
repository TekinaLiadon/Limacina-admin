
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  ssr: false,
  devtools: { enabled: true },
  css: ['~/assets/css/main.scss'],
  runtimeConfig: {
    public: {
      apiBase: "",
    }
  },
  app: {
    baseURL: '/panel',
    head: {
      htmlAttrs: { lang: 'ru' },
      title: 'Limacina',
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/panel/icon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400&family=JetBrains+Mono:wght@400&display=swap',
        },
      ],
    },
  },
  hooks: {
    'vite:extendConfig'(config, { isClient }) {
      if (!isClient) return
      type ViteEnvironments = { environments?: Record<string, object> }
      const mutable = config as unknown as ViteEnvironments
      if (!mutable.environments) mutable.environments = {}
      if (!mutable.environments.ssr) {
        mutable.environments.ssr = {
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
