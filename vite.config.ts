import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import mkcert from 'vite-plugin-mkcert'

function m4aMime(): Plugin {
  return {
    name: 'm4a-mime',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.endsWith('.m4a')) res.setHeader('Content-Type', 'audio/mp4')
        next()
      })
    },
  }
}

function terminalLog(): Plugin {
  return {
    name: 'terminal-log',
    configureServer(server) {
      server.middlewares.use('/__log', (req, res) => {
        let body = ''
        req.on('data', (chunk: Buffer) => { body += chunk })
        req.on('end', () => {
          try { process.stdout.write(JSON.parse(body).msg + '\n') } catch {}
          res.end()
        })
      })
    },
  }
}

// HTTPS required for WebXR on Meta Quest
export default defineConfig({
  plugins: [react(), mkcert(), terminalLog(), m4aMime()],
  server: {
    host: true,
    port: 5173,
  },
})
