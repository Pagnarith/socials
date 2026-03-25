import { describe, it, expect } from 'vitest';
import {
  createAlertDedupeKey,
  hasVideoBeenAlerted,
  recordAlertedVideo,
} from '../../scripts/lib/youtube-alert-state.js';

describe('youtube-alert-state', () => {
  describe('createAlertDedupeKey', () => {
    it('returns a hex string', async () => {
      const key = await createAlertDedupeKey({ title: 'Test Video', publishedAt: '2024-01-01T00:00:00Z' });
      expect(key).toMatch(/^[0-9a-f]{64}$/);
    });

    it('produces same key for same input', async () => {
      const alert = { title: 'Same', publishedAt: '2024-06-01T12:00:00Z' };
      const k1 = await createAlertDedupeKey(alert);
      const k2 = await createAlertDedupeKey(alert);
      expect(k1).toBe(k2);
    });

    it('produces different keys for different inputs', async () => {
      const k1 = await createAlertDedupeKey({ title: 'A', publishedAt: '2024-01-01' });
      const k2 = await createAlertDedupeKey({ title: 'B', publishedAt: '2024-01-01' });
      expect(k1).not.toBe(k2);
    });
  });

  describe('hasVideoBeenAlerted', () => {
    it('returns false for empty state', async () => {
      const result = await hasVideoBeenAlerted({ videos: [] }, { videoId: 'abc', title: 'T', publishedAt: 'P' });
      expect(result).toBe(false);
    });

    it('returns true when videoId matches', async () => {
      const alert = { videoId: 'xyz', title: 'T', publishedAt: 'P' };
      const state = { videos: [{ videoId: 'xyz', dedupeKey: 'old' }] };
      const result = await hasVideoBeenAlerted(state, alert);
      expect(result).toBe(true);
    });

    it('returns true when dedupeKey matches', async () => {
      const alert = { videoId: 'new', title: 'T', publishedAt: 'P' };
      const dedupeKey = await createAlertDedupeKey(alert);
      const state = { videos: [{ videoId: 'other', dedupeKey }] };
      const result = await hasVideoBeenAlerted(state, alert);
      expect(result).toBe(true);
    });
  });

  describe('recordAlertedVideo', () => {
    it('adds video to state', async () => {
      const alert = { videoId: 'v1', title: 'New Video', publishedAt: '2024-01-01', url: 'https://youtube.com/watch?v=v1' };
      const state = await recordAlertedVideo({ videos: [] }, alert);
      expect(state.videos).toHaveLength(1);
      expect(state.videos[0].videoId).toBe('v1');
      expect(state.videos[0].alertedAt).toBeTruthy();
    });

    it('deduplicates by videoId', async () => {
      const alert = { videoId: 'v1', title: 'Updated', publishedAt: '2024-01-01', url: 'https://youtube.com/watch?v=v1' };
      const existing = { videos: [{ videoId: 'v1', dedupeKey: 'old', title: 'Old' }] };
      const state = await recordAlertedVideo(existing, alert);
      expect(state.videos).toHaveLength(1);
      expect(state.videos[0].title).toBe('Updated');
    });
  });
});
