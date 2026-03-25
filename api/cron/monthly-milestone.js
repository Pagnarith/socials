import { authorizeCronRequest } from '../_lib/cron-auth.js';
import { sendChannelMessage } from '../_lib/telegram.js';
import { getMonthlyMilestoneMessage } from '../../telegram-bot/src/scheduler.js';

export default async function handler(req, res) {
  if (!authorizeCronRequest(req, res)) {
    return;
  }

  try {
    await sendChannelMessage(getMonthlyMilestoneMessage());
    return res.status(200).json({ ok: true, job: 'monthly-milestone' });
  } catch (error) {
    console.error('monthly-milestone cron failed:', error);
    return res.status(500).json({ ok: false, error: error.message });
  }
}
