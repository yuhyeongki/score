import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { generateCounselingReport } from './server/geminiService';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // 1. AI Counseling Endpoint
  app.post('/api/counseling', async (req, res) => {
    try {
      const result = await generateCounselingReport(req.body);
      res.setHeader('Content-Type', 'application/json');
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Analysis failed' });
    }
  });

  // 2. Google Sheets Proxy Endpoint
  app.get('/api/sheets-proxy', async (req, res) => {
    try {
      const targetUrl = req.query.url as string;
      if (!targetUrl || !targetUrl.startsWith('https://docs.google.com/')) {
        res.status(400).send('Invalid Google Sheets URL');
        return;
      }

      const fetchRes = await fetch(targetUrl);
      if (!fetchRes.ok) {
        res.status(fetchRes.status).send(`Google Sheets fetch error: ${fetchRes.statusText}`);
        return;
      }

      const text = await fetchRes.text();
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.send(text);
    } catch (err: any) {
      res.status(500).send(`Proxy error: ${err?.message || 'Failed'}`);
    }
  });

  // Serve Vite in development or static build in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EduPlan dev server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
