import { Request, Response, NextFunction } from 'express';
import { JWTService } from '../services/jwt.service';
import { AuthenticationError } from '../utils/errors';
import { logger } from '../utils/logger';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('No token provided');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new AuthenticationError('Invalid token format');
    }

    const jwtService = JWTService.getInstance();
    const decoded = jwtService.verifyAccessToken(token);

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      firstName: decoded.firstName,
      lastName: decoded.lastName,
    };

    next();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      res.status(401).json({
        success: false,
        error: {
          message: error.message,
          code: error.code || 'UNAUTHORIZED',
        },
      });
    } else {
      logger.error('Auth middleware error:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Authentication error',
          code: 'AUTH_ERROR',
        },
      });
    }
  }
};

// Optional: Role-based authorization
export const authorize = (..._roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          message: 'User not authenticated',
          code: 'UNAUTHORIZED',
        },
      });
      return;
    }

    // Check if user has required role (we can add role field to user model)
    // For now, this is a placeholder for future role-based permissions
    next();
  };
};