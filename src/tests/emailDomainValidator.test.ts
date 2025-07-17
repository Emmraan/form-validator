import checkEmailDomain from '../validators/emailDomainValidator';
import redisCache from '../services/redisCache';

// Mock the redisCache to test caching behavior
jest.mock('../services/redisCache', () => ({
  get: jest.fn(),
  set: jest.fn(),
  exists: jest.fn(),
  disconnect: jest.fn(),
  isRedisConnected: jest.fn(() => false),
}));

const mockRedisCache = redisCache as jest.Mocked<typeof redisCache>;

describe('Email Domain Validator with Redis Cache', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await redisCache.disconnect();
  });

  it('should return cached result when domain is already cached as blocked', async () => {
    const domain = 'hi2.in';
    mockRedisCache.get.mockResolvedValue('true');

    const result = await checkEmailDomain(domain);

    expect(result).toBe('Domain previously flagged');
    expect(mockRedisCache.get).toHaveBeenCalledWith(`email_domain:${domain}`);
    expect(mockRedisCache.set).not.toHaveBeenCalled();
  });

  it('should return null when domain is already cached as valid', async () => {
    const domain = 'gmail.com';
    mockRedisCache.get.mockResolvedValue('false');

    const result = await checkEmailDomain(domain);

    expect(result).toBe(null);
    expect(mockRedisCache.get).toHaveBeenCalledWith(`email_domain:${domain}`);
    expect(mockRedisCache.set).not.toHaveBeenCalled();
  });

  it('should check domain and cache result when not in cache', async () => {
    const domain = 'new-domain.com';
    mockRedisCache.get.mockResolvedValue(null);
    mockRedisCache.set.mockResolvedValue();

    // Mock https.get to simulate a timeout
    const mockHttps = require('https');
    const mockReq = {
      on: jest.fn((event: string, callback: () => void) => {
        if (event === 'error') {
          // Don't call the error callback immediately
        }
      }),
      setTimeout: jest.fn((_timeout: number, callback: () => void) => {
        // Simulate timeout
        setTimeout(callback, 10);
      }),
      destroy: jest.fn(),
    };

    mockHttps.get = jest.fn(() => mockReq);

    const result = await checkEmailDomain(domain);

    expect(mockRedisCache.get).toHaveBeenCalledWith(`email_domain:${domain}`);
    // The result should be a timeout error since we mocked the timeout
    expect(result).toBe('Email domain timed out');
  });

  it('should handle Redis cache errors gracefully', async () => {
    const domain = 'test-domain.com';
    // Mock Redis to return null (cache miss) when get fails
    mockRedisCache.get.mockResolvedValue(null);
    mockRedisCache.set.mockResolvedValue();

    // Mock https.get to simulate a quick error response
    const mockHttps = require('https');
    const mockReq = {
      on: jest.fn((event: string, callback: () => void) => {
        if (event === 'error') {
          // Simulate immediate error
          setTimeout(() => callback(), 10);
        }
      }),
      setTimeout: jest.fn(),
      destroy: jest.fn(),
    };

    mockHttps.get = jest.fn(() => mockReq);

    const result = await checkEmailDomain(domain);

    // Should still attempt to check the domain even if cache fails
    expect(mockRedisCache.get).toHaveBeenCalledWith(`email_domain:${domain}`);
    expect(result).toBe('Email domain does not support HTTPS or is invalid');
  });
});

describe('Redis Cache Service', () => {
  it('should indicate fallback mode when Redis is not connected', () => {
    expect(redisCache.isRedisConnected()).toBe(false);
  });
});
