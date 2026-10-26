import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { generateCounselingReport } from './server/geminiService';

function apiMiddlewarePlugin(): Plugin {
  return {
    name: 'api-middleware-plugin',
    configureServer(server) {
      // 1. AI Counseling Endpoint
      server.middlewares.use('/api/counseling', async (req, res) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const parsed = JSON.parse(body || '{}');
              const result = await generateCounselingReport(parsed);
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(JSON.stringify(result));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err?.message || 'Analysis failed' }));
            }
          });
        } else {
          res.statusCode = 405;
          res.end('Method Not Allowed');
        }
      });

      // 2. Google Sheets Proxy Endpoint (bypasses browser CORS for Google Sheets public CSV export)
      server.middlewares.use('/api/sheets-proxy', async (req, res) => {
        try {
          const urlObj = new URL(req.url || '', 'http://localhost');
          const targetUrl = urlObj.searchParams.get('url');

          if (!targetUrl || !targetUrl.startsWith('https://docs.google.com/')) {
            res.statusCode = 400;
            res.end('Invalid Google Sheets URL');
            return;
          }

          const fetchRes = await fetch(targetUrl);
          if (!fetchRes.ok) {
            res.statusCode = fetchRes.status;
            res.end(`Google Sheets fetch error: ${fetchRes.statusText}`);
            return;
          }

          const text = await fetchRes.text();
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          res.statusCode = 200;
          res.end(text);
        } catch (err: any) {
          res.statusCode = 500;
          res.end(`Proxy error: ${err?.message || 'Failed'}`);
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiMiddlewarePlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
