import { Request, Response, NextFunction } from 'express';
interface RateLimiterOptions {
    windowMs?: number;
    max?: number;
    message?: string;
}
export declare const rateLimiter: (options?: RateLimiterOptions) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export {};
//# sourceMappingURL=rateLimiter.d.ts.map