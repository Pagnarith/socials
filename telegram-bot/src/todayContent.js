import { Markup } from 'telegraf';
import { PRODUCT_LINKS, SOCIAL_LINKS } from './config.js';
import { escapeHtml } from './reply.js';
import {
  CATEGORY_ICONS,
  PLATFORM_ICONS,
  getTodaySchedule,
  videoTipForItem,
} from '../../shared/content-calendar.js';

export function formatTodayContentHtml(date = new Date()) {
  const { dayName, dateLabel, items } = getTodaySchedule(date);

  const lines = items.map((item, index) => {
    const icon = CATEGORY_ICONS[item.category] || PLATFORM_ICONS[item.platform] || '📌';
    const tip = videoTipForItem(item);
    return [
      `<b>${index + 1}. ${icon} ${escapeHtml(item.platform)}</b> — ${escapeHtml(item.type)}`,
      `💡 <i>Tip:</i> ${escapeHtml(tip)}`,
    ].join('\n');
  });

  return {
    text: `
📅 <b>Today's Content</b> (${escapeHtml(dateLabel)}, ${escapeHtml(dayName)})

From <a href="${SOCIAL_LINKS.website}">social.chakriya.net</a>

${lines.join('\n\n')}

🎬 Film the video pieces first, then adapt cuts for each platform.
    `.trim(),
    keyboard: Markup.inlineKeyboard([
      [Markup.button.url('📊 Open Social Ops', SOCIAL_LINKS.website)],
      [Markup.button.url('📱 App Store', PRODUCT_LINKS.appStore)],
      [Markup.button.callback('🔙 Back to Menu', 'back_menu')],
    ]),
  };
}
