import { RateLimiter } from '../../src/utils/rate-limiter';

describe('RateLimiter', () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    limiter = new RateLimiter({
      maxRequests: 3,
      windowMs: 1000, // 1 second
    });
  });

  it('should allow requests within limit', () => {
    expect(limiter.isAllowed('test-key')).toBe(true);
    expect(limiter.isAllowed('test-key')).toBe(true);
    expect(limiter.isAllowed('test-key')).toBe(true);
  });

  it('should block requests exceeding limit', () => {
    limiter.isAllowed('test-key');
    limiter.isAllowed('test-key');
    limiter.isAllowed('test-key');
    expect(limiter.isAllowed('test-key')).toBe(false);
  });

  it('should track different keys separately', () => {
    limiter.isAllowed('key1');
    limiter.isAllowed('key1');
    limiter.isAllowed('key1');
    
    expect(limiter.isAllowed('key1')).toBe(false);
    expect(limiter.isAllowed('key2')).toBe(true);
  });

  it('should reset after time window', async () => {
    limiter.isAllowed('test-key');
    limiter.isAllowed('test-key');
    limiter.isAllowed('test-key');
    
    expect(limiter.isAllowed('test-key')).toBe(false);
    
    // Wait for window to expire
    await new Promise(resolve => setTimeout(resolve, 1100));
    
    expect(limiter.isAllowed('test-key')).toBe(true);
  });

  it('should return correct remaining count', () => {
    expect(limiter.getRemaining('test-key')).toBe(3);
    limiter.isAllowed('test-key');
    expect(limiter.getRemaining('test-key')).toBe(2);
    limiter.isAllowed('test-key');
    expect(limiter.getRemaining('test-key')).toBe(1);
  });

  it('should reset specific key', () => {
    limiter.isAllowed('test-key');
    limiter.isAllowed('test-key');
    limiter.reset('test-key');
    
    expect(limiter.getRemaining('test-key')).toBe(3);
  });

  it('should reset all keys', () => {
    limiter.isAllowed('key1');
    limiter.isAllowed('key2');
    limiter.resetAll();
    
    expect(limiter.getRemaining('key1')).toBe(3);
    expect(limiter.getRemaining('key2')).toBe(3);
  });
});
