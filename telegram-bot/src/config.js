// Shared constants and social links — single source of truth.

export const CAMBODIA_TIMEZONE = 'Asia/Phnom_Penh';

export const BRAND = {
  name: 'Homework Palette',
  publisher: 'Chakriya',
  tagline: 'Grade 1–6 homework for families — Khmer & English',
};

export const SOCIAL_LINKS = {
  youtube: 'https://www.youtube.com/channel/UC3yMwRX2Cz-08IRrS9tIHYg',
  facebook: 'https://www.facebook.com/chakriyanet',
  instagram: 'https://www.instagram.com/homework_palette/',
  tiktok: 'https://www.tiktok.com/@homeworkpalette',
  // Ops dashboard (GitHub Pages)
  website: 'https://social.chakriya.net',
};

// Product & marketing links — Homework Palette only
export const PRODUCT_LINKS = {
  appStore: 'https://apps.apple.com/app/id6801068446',
  marketingSite: 'https://homework.chakriya.net/',
  poster: 'https://homework.chakriya.net/poster.html',
};

// Donation & support links
export const DONATE_LINKS = {
  buyMeACoffee: 'https://buymeacoffee.com/chakriya',
  githubSponsors: 'https://github.com/sponsors/Pagnarith',
  patreon: 'https://patreon.com/chakriya',
};

// Revenue stream definitions for the unified business model
export const REVENUE_STREAMS = {
  social: {
    name: 'Social Media Recognition',
    icon: '📺',
    sources: ['YouTube Ads', 'TikTok Creator Fund', 'Facebook In-Stream', 'Sponsorships'],
  },
  products: {
    name: 'App Store',
    icon: '📱',
    sources: ['Homework Palette free downloads', 'Palette Pro subscriptions'],
  },
  donations: {
    name: 'Community Support',
    icon: '💝',
    sources: ['Buy Me a Coffee', 'GitHub Sponsors', 'Patreon', 'YouTube Super Chat'],
  },
};
