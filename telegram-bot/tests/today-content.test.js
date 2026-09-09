import { describe, it, expect } from 'vitest';
import {
  WEEK_SCHEDULE,
  getTodaySchedule,
  videoTipForItem,
} from '../../shared/content-calendar.js';
import { formatTodayContentHtml } from '../src/todayContent.js';

describe('content calendar', () => {
  it('has seven days with at least one item each', () => {
    expect(WEEK_SCHEDULE).toHaveLength(7);
    for (const day of WEEK_SCHEDULE) {
      expect(day.items.length).toBeGreaterThan(0);
    }
  });

  it('returns today schedule for Cambodia timezone', () => {
    const today = getTodaySchedule();
    expect(today.dateLabel).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(today.items.length).toBeGreaterThan(0);
    expect(videoTipForItem(today.items[0]).length).toBeGreaterThan(20);
  });

  it('formatTodayContentHtml includes tips and ops link', () => {
    const { text } = formatTodayContentHtml();
    expect(text).toContain("Today's Content");
    expect(text).toContain('social.chakriya.net');
    expect(text).toContain('Tip:');
  });
});
