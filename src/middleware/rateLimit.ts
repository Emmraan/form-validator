import { Request, Response, NextFunction } from 'express';
import redisCache from '../services/redisCache';
import { buildErrorResponse } from '../utils/responseBuilder';

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 100;

export const rateLimitMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  if (req.method !== 'POST') {
    return next();
  }

  const ip = req.ip;
  if (!ip) {
    console.warn('Could not determine IP address for rate limiting.');
    return next();
  }

  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const key = `rate_limit:${ip}`;

  try {
    // Use a Redis pipeline for atomic operations
    const results = await redisCache.executePipeline((pipeline) => {
      pipeline.zadd(key, now.toString(), now.toString());
      pipeline.zremrangebyscore(key, '-inf', windowStart.toString());
      pipeline.zcard(key);
      pipeline.expire(key, Math.ceil(RATE_LIMIT_WINDOW_MS / 1000));
    });

    if (!results) {
      throw new Error('Redis pipeline execution failed or returned null.');
    }

    const currentRequestCount = results[2][1] as number;

    if (currentRequestCount > MAX_REQUESTS_PER_WINDOW) {
      const retryAfterSeconds = Math.ceil((windowStart + RATE_LIMIT_WINDOW_MS - now) / 1000);
      res.setHeader('Retry-After', retryAfterSeconds.toString());
      return res.status(429).json(buildErrorResponse('TOO_MANY_REQUESTS', `You have exceeded the request limit of ${MAX_REQUESTS_PER_WINDOW} requests per minute. Please try again after ${retryAfterSeconds} seconds.`));
    }

    next();
  } catch (error) {
    console.error(`Rate limiting error for IP ${ip}:`, error);

    next();
  }
};