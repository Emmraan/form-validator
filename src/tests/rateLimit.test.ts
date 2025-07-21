import request from 'supertest';
import express from 'express';
import { rateLimitMiddleware } from '../middleware/rateLimit';
import redisCache from '../services/redisCache';
import { buildErrorResponse } from '../utils/responseBuilder';

// Mock redisCache to control its behavior
jest.mock('../services/redisCache', () => ({
  __esModule: true,
  default: {
    executePipeline: jest.fn(),
    initialize: jest.fn(),
    disconnect: jest.fn(),
    isRedisConnected: jest.fn(() => true),
  },
}));

const mockRedisCache = redisCache as jest.Mocked<typeof redisCache>;

describe('Rate Limit Middleware', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.post('/test-post', rateLimitMiddleware, (req, res) => {
      res.status(200).send('Success');
    });
    app.get('/test-get', rateLimitMiddleware, (req, res) => {
      res.status(200).send('Success');
    });

    // Reset mocks before each test
    jest.clearAllMocks();
    mockRedisCache.isRedisConnected.mockReturnValue(true);
  });

  it('should allow GET requests without rate limiting', async () => {
    const response = await request(app).get('/test-get');
    expect(response.status).toBe(200);
    expect(mockRedisCache.executePipeline).not.toHaveBeenCalled();
  });

  it('should allow POST requests within the limit', async () => {
    mockRedisCache.executePipeline.mockResolvedValueOnce([
      ['status', 'OK'], // zadd
      ['status', 'OK'], // zremrangebyscore
      ['status', 50],   // zcard - current count
      ['status', 'OK'], // expire
    ]);

    const response = await request(app).post('/test-post');
    expect(response.status).toBe(200);
    expect(mockRedisCache.executePipeline).toHaveBeenCalledTimes(1);
  });

  it('should block POST requests when the limit is exceeded', async () => {
    mockRedisCache.executePipeline.mockResolvedValueOnce([
      ['status', 'OK'], // zadd
      ['status', 'OK'], // zremrangebyscore
      ['status', 101],  // zcard - current count (exceeds 100)
      ['status', 'OK'], // expire
    ]);

    const response = await request(app).post('/test-post');
    expect(response.status).toBe(429);
    expect(response.body).toEqual(buildErrorResponse('TOO_MANY_REQUESTS', expect.stringContaining('You have exceeded the request limit of 100 requests per minute.')));
    expect(response.headers['retry-after']).toBeDefined();
    expect(mockRedisCache.executePipeline).toHaveBeenCalledTimes(1);
  });

  it('should handle Redis errors gracefully and allow requests', async () => {
    mockRedisCache.executePipeline.mockRejectedValueOnce(new Error('Redis connection failed'));

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const response = await request(app).post('/test-post');
    expect(response.status).toBe(200); // Should still allow the request
    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Rate limiting error for IP'), expect.any(Error));
    expect(mockRedisCache.executePipeline).toHaveBeenCalledTimes(1);

    consoleErrorSpy.mockRestore();
  });

  it('should return 429 with correct Retry-After header when exactly at limit', async () => {
    // Simulate 100 requests already in the window, and the current one makes it 101
    mockRedisCache.executePipeline.mockResolvedValueOnce([
      ['status', 'OK'],
      ['status', 'OK'],
      ['status', 101], // This request makes it 101
      ['status', 'OK'],
    ]);

    const response = await request(app).post('/test-post');
    expect(response.status).toBe(429);
    expect(response.headers['retry-after']).toBeDefined();
    expect(parseInt(response.headers['retry-after'])).toBeGreaterThanOrEqual(0);
  });

  it('should handle multiple requests and block correctly over time', async () => {
    const MAX_REQUESTS = 100;
    const WINDOW_MS = 60 * 1000;
    const ip = '::1'; // Default IP for supertest

    // Mock Date.now() to control time for sliding window
    const mockDateNow = jest.spyOn(Date, 'now');
    let currentTime = Date.now();

    // Simulate requests over time
    for (let i = 1; i <= MAX_REQUESTS; i++) {
      mockDateNow.mockReturnValue(currentTime);
      mockRedisCache.executePipeline.mockResolvedValueOnce([
        ['status', 'OK'],
        ['status', 'OK'],
        ['status', i], // Current count
        ['status', 'OK'],
      ]);
      const response = await request(app).post('/test-post').set('X-Forwarded-For', ip);
      expect(response.status).toBe(200);
      expect(mockRedisCache.executePipeline).toHaveBeenCalledTimes(i);
      currentTime += 10; // Advance time slightly
    }

    // The 101st request should be blocked
    mockDateNow.mockReturnValue(currentTime);
    mockRedisCache.executePipeline.mockResolvedValueOnce([
      ['status', 'OK'],
      ['status', 'OK'],
      ['status', MAX_REQUESTS + 1], // Current count
      ['status', 'OK'],
    ]);
    const blockedResponse = await request(app).post('/test-post').set('X-Forwarded-For', ip);
    expect(blockedResponse.status).toBe(429);
    expect(blockedResponse.headers['retry-after']).toBeDefined();
    expect(mockRedisCache.executePipeline).toHaveBeenCalledTimes(MAX_REQUESTS + 1);

    // Advance time past the window and try again
    currentTime += WINDOW_MS + 100; // Move past the 1-minute window
    mockDateNow.mockReturnValue(currentTime);
    mockRedisCache.executePipeline.mockResolvedValueOnce([
      ['status', 'OK'],
      ['status', 'OK'],
      ['status', 1], // New window, count resets
      ['status', 'OK'],
    ]);
    const allowedResponseAfterWindow = await request(app).post('/test-post').set('X-Forwarded-For', ip);
    expect(allowedResponseAfterWindow.status).toBe(200);
    expect(mockRedisCache.executePipeline).toHaveBeenCalledTimes(MAX_REQUESTS + 2);

    mockDateNow.mockRestore();
  });
});