import dotenv from 'dotenv';
import { createBot } from '../../telegram-bot/src/createBot.js';
import { sendWeeklyReviewReminder } from '../../telegram-bot/src/scheduler.js';
import { authorizeCronRequest } from '../_lib/cron-auth.js';

dotenv.config();

const bot = createBot();

export default async function handler(req, res) {
  if (!authorizeCronRequest(req, res)) {
    return;
  }

  try {
    await sendWeeklyReviewReminder(bot);
    return res.status(200).json({ ok: true, job: 'weekly-review' });
  } catch (error) {
    console.error('weekly-review cron failed:', error);
    return res.status(500).json({ ok: false, error: error.message });
  }
}
