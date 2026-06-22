import { NextFunction, Request, RequestHandler, Response } from 'express';

export const asyncHandler = (handler: RequestHandler) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
};
