import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock fetch globally to avoid real HTTP calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('cron-auth', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.resetModules();
  });

  it('allows request when no CRON_SECRET is set', async () => {
    process.env.CRON_SECRET = '';
    const { authorizeCronRequest } = await import('../../api/_lib/cron-auth.js');
    const req = { headers: {} };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    expect(authorizeCronRequest(req, res)).toBe(true);
  });

  it('allows request with valid bearer token', async () => {
    process.env.CRON_SECRET = 'test-secret-123';
    const { authorizeCronRequest } = await import('../../api/_lib/cron-auth.js?t=2');
    const req = { headers: { authorization: 'Bearer test-secret-123' } };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    expect(authorizeCronRequest(req, res)).toBe(true);
  });

  it('rejects request with invalid bearer token', async () => {
    process.env.CRON_SECRET = 'test-secret-123';
    const { authorizeCronRequest } = await import('../../api/_lib/cron-auth.js?t=3');
    const req = { headers: { authorization: 'Bearer wrong-token' } };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    expect(authorizeCronRequest(req, res)).toBe(false);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('rejects request with missing authorization header', async () => {
    process.env.CRON_SECRET = 'test-secret-123';
    const { authorizeCronRequest } = await import('../../api/_lib/cron-auth.js?t=4');
    const req = { headers: {} };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    expect(authorizeCronRequest(req, res)).toBe(false);
  });
});
