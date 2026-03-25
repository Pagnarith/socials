import dotenv from 'dotenv';
import { createBot } from '../../telegram-bot/src/createBot.js';
import { checkAndSendLatestYouTubeAlert } from '../../telegram-bot/src/scheduler.js';
import { authorizeCronRequest } from '../_lib/cron-auth.js';

dotenv.config();

const bot = createBot();

export default async function handler(req, res) {
  if (!authorizeCronRequest(req, res)) {
    return;
  }

  try {
    const result = await checkAndSendLatestYouTubeAlert(bot);
    return res.status(200).json({ ok: true, job: 'youtube-alerts', ...result });
  } catch (error) {
    console.error('youtube-alerts cron failed:', error);
    return res.status(500).json({ ok: false, error: error.message });
  }
}
