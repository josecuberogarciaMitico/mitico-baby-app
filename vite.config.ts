import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const buildId = `${new Date().toISOString().replace(/[-:.]/g, '')}-${Math.random().toString(36).slice(2, 10)}`

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'mitico-pwa-build-version',
      apply: 'build',
      generateBundle() {
        this.emitFile({
          type: 'asset',
          fileName: 'sw-build-version.js',
          source: `self.__MITICO_BUILD_ID__ = ${JSON.stringify(buildId)};\n`,
        })
      },
    },
  ],
})
