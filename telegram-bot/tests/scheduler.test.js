import { describe, it, expect } from 'vitest';
import {
  getDailyContentMessage,
  getWeeklyReviewMessage,
  getMonthlyMilestoneMessage,
} from '../src/scheduler.js';

describe('message generators', () => {
  it('getDailyContentMessage returns a non-empty string with markdown bold', () => {
    const msg = getDailyContentMessage();
    expect(typeof msg).toBe('string');
    expect(msg.length).toBeGreaterThan(0);
    expect(msg).toContain('*Daily Content Reminder*');
    expect(msg).toContain('📅');
  });

  it('getDailyContentMessage includes Cambodia date', () => {
    const msg = getDailyContentMessage();
    // Should contain a YYYY-MM-DD date
    expect(msg).toMatch(/\d{4}-\d{2}-\d{2}/);
  });

  it('getWeeklyReviewMessage returns valid review content', () => {
    const msg = getWeeklyReviewMessage();
    expect(typeof msg).toBe('string');
    expect(msg).toContain('*Weekly Review Time!*');
    expect(msg).toContain('YouTube Studio');
  });

  it('getMonthlyMilestoneMessage returns valid milestone content', () => {
    const msg = getMonthlyMilestoneMessage();
    expect(typeof msg).toBe('string');
    expect(msg).toContain('*Monthly Milestone Check*');
    expect(msg).toContain('Revenue');
  });
});
