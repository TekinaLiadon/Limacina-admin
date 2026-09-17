import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '~': import.meta.dirname,
    },
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: [
        'api/**',
        'utils/**',
        'composables/useApi.ts',
        'composables/useApiResource.ts',
        'composables/useUserAction.ts',
        'composables/useLauncherConfig.ts',
        'composables/useLogs.ts',
        'composables/useUsersList.ts',
      ],
      exclude: ['tests/**', 'node_modules/**', '.nuxt/**', '.output/**', 'dist/**', 'coverage/**', '**/*.config.ts', '**/*.d.ts'],
      reporter: ['text', 'json-summary'],
      thresholds: {
        statements: 95,
        branches: 95,
        functions: 95,
        lines: 95,
      },
    },
  },
})
