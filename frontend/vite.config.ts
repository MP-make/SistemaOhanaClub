import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react'

const apiMockPlugin = (): Plugin => ({
  name: 'api-mock-middleware',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url && req.url.startsWith('/api/reservas') && req.method === 'GET') {
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 200;
        res.end(JSON.stringify([]));
        return;
      }
      if (req.url && req.url.startsWith('/api/reservas') && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
          try {
            const data = JSON.parse(body || '{}');
            const responseData = {
              ...data,
              id: data.id || `res-${Date.now().toString().slice(-5)}`,
              estado: 'CONFIRMADA',
              fechaCreacion: new Date().toISOString()
            };
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 201;
            res.end(JSON.stringify(responseData));
          } catch {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Invalid JSON' }));
          }
        });
        return;
      }
      if (req.url && req.url.startsWith('/api/ventas') && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
          try {
            const data = JSON.parse(body || '{}');
            const responseData = {
              ...data,
              id: data.id || `vta-${Date.now().toString().slice(-5)}`,
              estado: 'COMPLETADA',
              fechaCreacion: new Date().toISOString()
            };
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 201;
            res.end(JSON.stringify(responseData));
          } catch {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Invalid JSON' }));
          }
        });
        return;
      }
      next();
    });
  }
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), apiMockPlugin()],
  server: {
    port: 3000,
    host: true
  }
})
