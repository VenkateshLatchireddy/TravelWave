import { Request, Response, NextFunction } from 'express';
import z from 'zod';
import { ValidationError } from '../utils/errors';

export const validateRequest = (schema: z.ZodTypeAny) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = await schema.parseAsync(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const zErr = error as z.ZodError;
        const errors: { field: string; message: string }[] = zErr.errors.map((err: z.ZodIssue) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        next(new ValidationError(
          `Validation failed: ${errors.map(e => e.message).join(', ')}`
        ));
        return;
      }
      next(error as Error);
    }
  };
};
