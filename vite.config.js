import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { processLead } from './api/_lead.js'

// Backend en desarrollo: replica /api/kommo de Vercel
const kommoApiPlugin = () => ({
  name: 'kommo-api',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url !== '/api/kommo' || req.method !== 'POST') return next();
      let body = '';
      req.on('data', (chunk) => { body += chunk.toString(); });
      req.on('end', async () => {
        res.setHeader('Content-Type', 'application/json');
        try {
          const { status, body: out } = await processLead(JSON.parse(body), {
            userAgent: req.headers['user-agent'],
            url: req.headers['referer'],
          });
          res.statusCode = status;
          res.end(JSON.stringify(out));
        } catch (err) {
          console.error('[ALTERNATIVA] Dev Server Error:', err);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'Error interno del servidor dev' }));
        }
      });
    });
  }
});

export default defineConfig({
  plugins: [react(), kommoApiPlugin()],
})
