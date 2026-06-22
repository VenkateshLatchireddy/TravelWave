"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimiter = void 0;
const rate_limiter_flexible_1 = require("rate-limiter-flexible");
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
const rateLimiter = (options = {}) => {
    const windowMs = options.windowMs || 15 * 60 * 1000;
    const max = options.max || 100;
    const limiter = new rate_limiter_flexible_1.RateLimiterMemory({
        points: max,
        duration: Math.ceil(windowMs / 1000),
    });
    return async (req, res, next) => {
        try {
            const forwardedFor = req.headers['x-forwarded-for'];
            const key = req.ip || (Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor) || 'unknown';
            await limiter.consume(key);
            const remaining = await limiter.get(key);
            if (remaining) {
                res.setHeader('X-RateLimit-Limit', max);
                res.setHeader('X-RateLimit-Remaining', remaining.remainingPoints);
                res.setHeader('X-RateLimit-Reset', Math.ceil(Date.now() / 1000) + (remaining.msBeforeNext / 1000));
            }
            next();
        }
        catch (error) {
            logger_1.logger.warn('Rate limit exceeded:', {
                ip: req.ip,
                path: req.path,
            });
            const message = options.message || 'Too many requests, please try again later.';
            next(new errors_1.RateLimitError(message));
        }
    };
};
exports.rateLimiter = rateLimiter;
//# sourceMappingURL=rateLimiter.js.map