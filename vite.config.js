import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'admin-static-rewrite',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/admin' || req.url === '/admin/' || req.url.startsWith('/admin?')) {
            req.url = '/admin/index.html'
          }
          next()
        })
      }
    }
  ]
})
