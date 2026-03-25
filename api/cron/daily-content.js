import { authorizeCronRequest } from '../_lib/cron-auth.js';
import { sendChannelMessage } from '../_lib/telegram.js';
import { getDailyContentMessage } from '../../telegram-bot/src/scheduler.js';

export default async function handler(req, res) {
  if (!authorizeCronRequest(req, res)) {
    return;
  }

  try {
    await sendChannelMessage(getDailyContentMessage());
    return res.status(200).json({ ok: true, job: 'daily-content' });
  } catch (error) {
    console.error('daily-content cron failed:', error);
    return res.status(500).json({ ok: false, error: error.message });
  }
}
