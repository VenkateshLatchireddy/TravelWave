import { Request, Response, NextFunction } from 'express';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { RateLimitError } from '../utils/errors';
import { logger } from '../utils/logger';

interface RateLimiterOptions {
  windowMs?: number;
  max?: number;
  message?: string;
}

export const rateLimiter = (options: RateLimiterOptions = {}) => {
  const windowMs = options.windowMs || 15 * 60 * 1000; // 15 minutes default
  const max = options.max || 100; // 100 requests per window default

  const limiter = new RateLimiterMemory({
    points: max,
    duration: Math.ceil(windowMs / 1000),
  });

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const forwardedFor = req.headers['x-forwarded-for'];
      const key = req.ip || (Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor) || 'unknown';
      
      await limiter.consume(key);
      
      // Add rate limit headers
      const remaining = await limiter.get(key);
      if (remaining) {
        res.setHeader('X-RateLimit-Limit', max);
        res.setHeader('X-RateLimit-Remaining', remaining.remainingPoints);
        res.setHeader('X-RateLimit-Reset', Math.ceil(Date.now() / 1000) + (remaining.msBeforeNext / 1000));
      }
      
      next();
    } catch (error) {
      logger.warn('Rate limit exceeded:', {
        ip: req.ip,
        path: req.path,
      });
      
      const message = options.message || 'Too many requests, please try again later.';
      next(new RateLimitError(message));
    }
  };
};
