import dotenv from 'dotenv';
import { createBot } from '../../telegram-bot/src/createBot.js';
import { sendDailyContentReminder } from '../../telegram-bot/src/scheduler.js';
import { authorizeCronRequest } from '../_lib/cron-auth.js';

dotenv.config();

const bot = createBot();

export default async function handler(req, res) {
  if (!authorizeCronRequest(req, res)) {
    return;
  }

  try {
    await sendDailyContentReminder(bot);
    return res.status(200).json({ ok: true, job: 'daily-content' });
  } catch (error) {
    console.error('daily-content cron failed:', error);
    return res.status(500).json({ ok: false, error: error.message });
  }
}
