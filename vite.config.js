import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { createResponseHandler } from './api/responses.js'
import { configuredStore } from './server/redis.js'

export default defineConfig(({ mode }) => {
  const environment = { ...process.env, ...loadEnv(mode, process.cwd(), '') }
  return {
    plugins: [react(), {
      name: 'garden-response-api',
      configureServer(server) {
        const handler = createResponseHandler({ getStore: () => configuredStore(environment) })
        server.middlewares.use('/api/responses', handler)
      },
    }],
  }
})
