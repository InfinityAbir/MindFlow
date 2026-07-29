import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwindcss()],
    server: {
      allowedHosts: ['.monkeycode-ai.live'],
      proxy: {
        '/api/ai': {
          target: 'https://api.groq.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/ai/, '/openai/v1'),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setHeader('Authorization', `Bearer ${env.GROQ_API_KEY}`)
            })
          },
        },
      },
    },
  }
})
