/** Weekly content plan — source of truth for social.chakriya.net and Telegram /today */

export const WEEK_SCHEDULE = [
  {
    day: 'Monday',
    items: [
      { platform: 'Facebook', type: 'Parent tip post (Khmer + EN)', category: 'parenting' },
      { platform: 'Instagram', type: 'App feature Reel', category: 'app' },
      { platform: 'TikTok', type: '60s homework tip', category: 'parenting' },
    ],
  },
  {
    day: 'Tuesday',
    items: [
      { platform: 'YouTube', type: 'Homework Palette app demo', category: 'app' },
      { platform: 'Facebook', type: 'Share YouTube demo', category: 'app' },
      { platform: 'Instagram', type: 'Library carousel', category: 'homework' },
      { platform: 'TikTok', type: 'Grade pick clip', category: 'app' },
    ],
  },
  {
    day: 'Wednesday',
    items: [
      { platform: 'Facebook', type: 'Feature highlight post', category: 'app' },
      { platform: 'Instagram', type: 'Story: tip of the day', category: 'parenting' },
      { platform: 'TikTok', type: 'Quick tip (30s)', category: 'homework' },
    ],
  },
  {
    day: 'Thursday',
    items: [
      { platform: 'YouTube', type: 'Lesson recorder walkthrough', category: 'app' },
      { platform: 'Facebook', type: 'Share YouTube video', category: 'app' },
      { platform: 'Instagram', type: 'Recorder Reel', category: 'app' },
      { platform: 'TikTok', type: 'Behind-the-scenes', category: 'general' },
    ],
  },
  {
    day: 'Friday',
    items: [
      { platform: 'Facebook', type: 'App Store CTA + engagement', category: 'app' },
      { platform: 'Instagram', type: 'Q&A Story', category: 'parenting' },
      { platform: 'TikTok', type: 'Trending remix + app CTA', category: 'general' },
    ],
  },
  {
    day: 'Saturday',
    items: [
      { platform: 'YouTube', type: 'Bilingual family homework clip', category: 'homework' },
      { platform: 'Facebook', type: 'Poster share', category: 'app' },
      { platform: 'Instagram', type: 'Best moments Reel', category: 'general' },
      { platform: 'TikTok', type: 'Best moments (60s)', category: 'general' },
    ],
  },
  {
    day: 'Sunday',
    items: [
      { platform: 'Facebook', type: 'Week recap post', category: 'general' },
      { platform: 'Instagram', type: 'Week recap carousel', category: 'general' },
    ],
  },
];

export const CATEGORY_ICONS = {
  app: '📱',
  homework: '📚',
  parenting: '👨‍👩‍👧',
  general: '📋',
};

export const PLATFORM_ICONS = {
  YouTube: '📺',
  Facebook: '📘',
  Instagram: '📸',
  TikTok: '📱',
};

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function getCambodiaDateParts(date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Phnom_Penh',
    weekday: 'long',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  return Object.fromEntries(
    formatter
      .formatToParts(date)
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value]),
  );
}

export function getTodaySchedule(date = new Date()) {
  const parts = getCambodiaDateParts(date);
  const dayName = parts.weekday;
  const day = WEEK_SCHEDULE.find((entry) => entry.day === dayName)
    ?? WEEK_SCHEDULE[DAY_NAMES.indexOf(dayName)]
    ?? WEEK_SCHEDULE[0];

  return {
    dayName,
    dateLabel: `${parts.year}-${parts.month}-${parts.day}`,
    items: day.items,
  };
}

/** Practical filming / posting tips for each scheduled item */
export function videoTipForItem(item) {
  const key = `${item.platform}|${item.type}`.toLowerCase();

  const exact = {
    'youtube|homework palette app demo':
      'Screen-record the app (9:16 or 16:9). Hook in 3s: “Grades 1–6 homework, free.” Show library → one worksheet → App Store CTA. Keep under 2 min; pin the App Store link.',
    'facebook|share youtube demo':
      'Native share the YouTube link with a 1-line Khmer + EN caption and a screenshot. Ask parents which grade they need.',
    'instagram|library carousel':
      '5–7 slides: cover → grade pick → sample exercise → print → CTA. Use clear Khmer/EN text overlays; save as both post + Story.',
    'tiktok|grade pick clip':
      '15–25s vertical: open app → tap a grade → flash 2 exercises. Text on screen; end with “Free on App Store.”',
    'youtube|lesson recorder walkthrough':
      'Record yourself starting a lesson recording, talking for ~20s, then stop & share. Narrate why parents love background finish + optional face cam.',
    'facebook|share youtube video':
      'Cross-post with a question sticker-style caption (“Tried the recorder yet?”). Tag Homework Palette site in comments.',
    'instagram|recorder reel':
      'Fast cuts of start → record → export done. Trending audio OK; keep UI readable; CTA sticker to App Store.',
    'tiktok|behind-the-scenes':
      'Desk/setup clip: phone + notebook. 20–40s, casual voiceover in Khmer or EN about today’s homework tip.',
    'facebook|parent tip post (khmer + en)':
      'One tip only. Photo or 30–45s talk-to-camera. Caption: Khmer first, English under. Soft CTA to download the app.',
    'instagram|app feature reel':
      'One feature focus (builder or read-aloud). 15–30s, big captions, end frame with App Store badge.',
    'tiktok|60s homework tip':
      'Problem → tip → app demo beat. Captions always on; first line must hook (“Stuck on homework?”).',
    'facebook|feature highlight post':
      'Single screenshot + 3 bullets. Pin comment with App Store link. Ask: free library or Pro quizzes?',
    'instagram|story: tip of the day':
      '2–4 Story frames: tip → app screen → poll (“Useful?”) → link sticker to homework.chakriya.net.',
    'tiktok|quick tip (30s)':
      'One tip, one take. Face cam or screen. Hard cut at 30s with download CTA.',
    'facebook|app store cta + engagement':
      'Poster or App Store screenshot. Caption with clear “Download free” + ask a question for comments.',
    'instagram|q&a story':
      'Invite homework questions; answer 2–3 with app screenshots. Link sticker to App Store.',
    'tiktok|trending remix + app cta':
      'Use a trending sound; first 2s hook, then 5s app insert, end CTA. Keep brand colors consistent.',
    'youtube|bilingual family homework clip':
      'Parent + child vibe (or solo). Switch Khmer/EN lines. Show one exercise solved with the app open beside.',
    'facebook|poster share':
      'Post the App Store poster image; caption in Khmer + EN; link homework.chakriya.net/poster.html.',
    'instagram|best moments reel':
      'Compile week’s best 3 clips (5–8s each). Text: “This week in Homework Palette.”',
    'tiktok|best moments (60s)':
      'Same montage as IG; punchier cuts; end with follow + App Store.',
    'facebook|week recap post':
      'Carousel or album of the week’s posts + 3 wins + next week tease. Link ops calendar.',
    'instagram|week recap carousel':
      'Cover + 4 highlight slides + CTA. Soft music; keep text large for mobile.',
  };

  if (exact[key]) return exact[key];

  // Fallbacks by platform
  const byPlatform = {
    YouTube:
      'Plan a clear hook, one demo path, captions, and App Store link in description + pinned comment.',
    Facebook:
      'Write a bilingual caption, one strong visual, and end with a question to boost comments.',
    Instagram:
      'Shoot vertical, add on-screen text, keep under 30s when possible, and add a link/CTA where available.',
    TikTok:
      'Hook in the first second, captions on, one idea only, finish with App Store CTA.',
  };

  return byPlatform[item.platform]
    ?? 'Keep it short, show the app clearly, and end with a free App Store download CTA.';
}
