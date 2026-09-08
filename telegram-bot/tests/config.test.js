import { describe, it, expect } from 'vitest';
import {
  BRAND,
  CAMBODIA_TIMEZONE,
  SOCIAL_LINKS,
  PRODUCT_LINKS,
  REVENUE_STREAMS,
} from '../src/config.js';

describe('config', () => {
  it('exports CAMBODIA_TIMEZONE', () => {
    expect(CAMBODIA_TIMEZONE).toBe('Asia/Phnom_Penh');
  });

  it('brands Homework Palette with Chakriya as publisher', () => {
    expect(BRAND.name).toBe('Homework Palette');
    expect(BRAND.publisher).toBe('Chakriya');
  });

  it('exports all social links', () => {
    expect(SOCIAL_LINKS).toHaveProperty('youtube');
    expect(SOCIAL_LINKS).toHaveProperty('facebook');
    expect(SOCIAL_LINKS).toHaveProperty('instagram');
    expect(SOCIAL_LINKS).toHaveProperty('tiktok');
    expect(SOCIAL_LINKS).toHaveProperty('website');
  });

  it('exports Homework Palette product links', () => {
    expect(PRODUCT_LINKS.appStore).toContain('id6801068446');
    expect(PRODUCT_LINKS.marketingSite).toBe('https://homework.chakriya.net/');
    expect(PRODUCT_LINKS.poster).toContain('poster.html');
    expect(PRODUCT_LINKS).not.toHaveProperty('rhinoStore');
    expect(PRODUCT_LINKS).not.toHaveProperty('minecraftMarketplace');
    expect(PRODUCT_LINKS).not.toHaveProperty('gumroad');
  });

  it('revenue streams are social, App Store, and donations', () => {
    expect(Object.keys(REVENUE_STREAMS).sort()).toEqual(['donations', 'products', 'social']);
    expect(REVENUE_STREAMS.products.name).toBe('App Store');
  });

  it('social and product links are valid URLs', () => {
    for (const url of [...Object.values(SOCIAL_LINKS), ...Object.values(PRODUCT_LINKS)]) {
      expect(() => new URL(url)).not.toThrow();
    }
  });
});
