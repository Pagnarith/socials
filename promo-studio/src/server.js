import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { apiRouter } from './routes/api.js';
import { failOrphanedJobs } from './lib/jobs.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Always load promo-studio/.env (workspace cwd may be the monorepo root).
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const port = Number(process.env.PORT || 8787);

app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, '../public')));
app.use('/v1', apiRouter);

app.get('/api', (_req, res) => {
  res.redirect('/v1/health');
});

await failOrphanedJobs();

app.listen(port, () => {
  console.log(`Promo Studio listening on http://localhost:${port}`);
  console.log(`Health: http://localhost:${port}/v1/health`);
  console.log(`UI:     http://localhost:${port}/`);
});
