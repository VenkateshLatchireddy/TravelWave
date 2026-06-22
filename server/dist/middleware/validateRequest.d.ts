import { Request, Response, NextFunction } from 'express';
import z from 'zod';
export declare const validateRequest: (schema: z.ZodTypeAny) => (req: Request, _res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=validateRequest.d.ts.map