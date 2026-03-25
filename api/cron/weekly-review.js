import { authorizeCronRequest } from '../_lib/cron-auth.js';
import { sendChannelMessage } from '../_lib/telegram.js';
import { getWeeklyReviewMessage } from '../../telegram-bot/src/scheduler.js';

export default async function handler(req, res) {
  if (!authorizeCronRequest(req, res)) {
    return;
  }

  try {
    await sendChannelMessage(getWeeklyReviewMessage());
    return res.status(200).json({ ok: true, job: 'weekly-review' });
  } catch (error) {
    console.error('weekly-review cron failed:', error);
    return res.status(500).json({ ok: false, error: error.message });
  }
}
