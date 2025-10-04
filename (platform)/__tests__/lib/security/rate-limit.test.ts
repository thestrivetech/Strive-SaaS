import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit';

// Mock Upstash Redis
jest.mock('@upstash/ratelimit', () => ({
  Ratelimit: jest.fn().mockImplementation(() => ({
    limit: jest.fn().mockResolvedValue({
      success: true,
      limit: 100,
      remaining: 99,
      reset: Date.now() + 60000,
    }),
  })),
}));

jest.mock('@upstash/redis', () => ({
  Redis: {
    fromEnv: jest.fn().mockReturnValue({}),
  },
}));

describe('Rate Limiting', () => {
  describe('checkRateLimit', () => {
    it('should allow requests when no limiter is provided (development mode)', async () => {
      const result = await checkRateLimit('test-identifier', null);

      expect(result.success).toBe(true);
      expect(result.limit).toBe(Infinity);
      expect(result.remaining).toBe(Infinity);
      expect(result.reset).toBeInstanceOf(Date);
    });

    it('should return success when rate limit is not exceeded', async () => {
      const mockLimiter = {
        limit: jest.fn().mockResolvedValue({
          success: true,
          limit: 100,
          remaining: 95,
          reset: Date.now() + 60000,
        }),
      };

      const result = await checkRateLimit('test-user', mockLimiter as never);

      expect(result.success).toBe(true);
      expect(result.limit).toBe(100);
      expect(result.remaining).toBe(95);
      expect(mockLimiter.limit).toHaveBeenCalledWith('test-user');
    });

    it('should return failure when rate limit is exceeded', async () => {
      const mockLimiter = {
        limit: jest.fn().mockResolvedValue({
          success: false,
          limit: 100,
          remaining: 0,
          reset: Date.now() + 60000,
        }),
      };

      const result = await checkRateLimit('test-user', mockLimiter as never);

      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should handle rate limiter errors gracefully', async () => {
      const mockLimiter = {
        limit: jest.fn().mockRejectedValue(new Error('Redis connection failed')),
      };

      // Should allow request if rate limiter fails (fail-open)
      const result = await checkRateLimit('test-user', mockLimiter as never);

      expect(result.success).toBe(true);
      expect(result.limit).toBe(0);
      expect(result.remaining).toBe(0);
    });

    it('should convert reset timestamp to Date object', async () => {
      const resetTime = Date.now() + 120000; // 2 minutes from now
      const mockLimiter = {
        limit: jest.fn().mockResolvedValue({
          success: true,
          limit: 100,
          remaining: 50,
          reset: resetTime,
        }),
      };

      const result = await checkRateLimit('test-user', mockLimiter as never);

      expect(result.reset).toBeInstanceOf(Date);
      expect(result.reset.getTime()).toBe(resetTime);
    });
  });

  describe('getClientIdentifier', () => {
    it('should extract IP from x-forwarded-for header', () => {
      const mockRequest = new Request('https://example.com', {
        headers: {
          'x-forwarded-for': '192.168.1.1, 10.0.0.1',
        },
      });

      const identifier = getClientIdentifier(mockRequest);
      expect(identifier).toBe('192.168.1.1');
    });

    it('should extract IP from x-real-ip header', () => {
      const mockRequest = new Request('https://example.com', {
        headers: {
          'x-real-ip': '192.168.1.100',
        },
      });

      const identifier = getClientIdentifier(mockRequest);
      expect(identifier).toBe('192.168.1.100');
    });

    it('should prefer x-forwarded-for over x-real-ip', () => {
      const mockRequest = new Request('https://example.com', {
        headers: {
          'x-forwarded-for': '192.168.1.1',
          'x-real-ip': '192.168.1.2',
        },
      });

      const identifier = getClientIdentifier(mockRequest);
      expect(identifier).toBe('192.168.1.1');
    });

    it('should handle multiple IPs in x-forwarded-for (take first)', () => {
      const mockRequest = new Request('https://example.com', {
        headers: {
          'x-forwarded-for': '  192.168.1.1  ,  10.0.0.1  ,  172.16.0.1  ',
        },
      });

      const identifier = getClientIdentifier(mockRequest);
      expect(identifier).toBe('192.168.1.1');
    });

    it('should return "unknown" if no IP headers present', () => {
      const mockRequest = new Request('https://example.com');

      const identifier = getClientIdentifier(mockRequest);
      expect(identifier).toBe('unknown');
    });

    it('should handle empty headers gracefully', () => {
      const mockRequest = new Request('https://example.com', {
        headers: {
          'x-forwarded-for': '',
          'x-real-ip': '',
        },
      });

      const identifier = getClientIdentifier(mockRequest);
      expect(identifier).toBe('unknown');
    });
  });

  describe('Rate Limit Integration', () => {
    it('should enforce different limits for different identifiers', async () => {
      const mockLimiter = {
        limit: jest.fn()
          .mockResolvedValueOnce({
            success: true,
            limit: 100,
            remaining: 99,
            reset: Date.now() + 60000,
          })
          .mockResolvedValueOnce({
            success: true,
            limit: 100,
            remaining: 98,
            reset: Date.now() + 60000,
          }),
      };

      await checkRateLimit('user-1', mockLimiter as never);
      await checkRateLimit('user-2', mockLimiter as never);

      expect(mockLimiter.limit).toHaveBeenCalledTimes(2);
      expect(mockLimiter.limit).toHaveBeenCalledWith('user-1');
      expect(mockLimiter.limit).toHaveBeenCalledWith('user-2');
    });

    it('should track remaining requests correctly', async () => {
      const mockLimiter = {
        limit: jest.fn()
          .mockResolvedValueOnce({
            success: true,
            limit: 10,
            remaining: 9,
            reset: Date.now() + 60000,
          })
          .mockResolvedValueOnce({
            success: true,
            limit: 10,
            remaining: 8,
            reset: Date.now() + 60000,
          })
          .mockResolvedValueOnce({
            success: true,
            limit: 10,
            remaining: 7,
            reset: Date.now() + 60000,
          }),
      };

      const result1 = await checkRateLimit('user', mockLimiter as never);
      expect(result1.remaining).toBe(9);

      const result2 = await checkRateLimit('user', mockLimiter as never);
      expect(result2.remaining).toBe(8);

      const result3 = await checkRateLimit('user', mockLimiter as never);
      expect(result3.remaining).toBe(7);
    });
  });
});
