import { describe, it, expect } from 'vitest';
import { CAMBODIA_TIMEZONE, SOCIAL_LINKS } from '../src/config.js';

describe('config', () => {
  it('exports CAMBODIA_TIMEZONE', () => {
    expect(CAMBODIA_TIMEZONE).toBe('Asia/Phnom_Penh');
  });

  it('exports all social links', () => {
    expect(SOCIAL_LINKS).toHaveProperty('youtube');
    expect(SOCIAL_LINKS).toHaveProperty('facebook');
    expect(SOCIAL_LINKS).toHaveProperty('instagram');
    expect(SOCIAL_LINKS).toHaveProperty('tiktok');
    expect(SOCIAL_LINKS).toHaveProperty('website');
  });

  it('social links are valid URLs', () => {
    for (const url of Object.values(SOCIAL_LINKS)) {
      expect(() => new URL(url)).not.toThrow();
    }
  });
});
