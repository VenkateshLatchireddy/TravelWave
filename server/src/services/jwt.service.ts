import { sign, verify, JsonWebTokenError, Secret, TokenExpiredError } from 'jsonwebtoken';
import crypto from 'crypto';
import { AuthenticationError } from '../utils/errors';
import { logger } from '../utils/logger';

export interface ITokenPayload {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface ITokenResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpires: Date;
  refreshTokenExpires: Date;
}

export class JWTService {
  private static instance: JWTService;
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly accessTokenExpiry: string;
  private readonly refreshTokenExpiry: string;

  private constructor() {
    this.accessTokenSecret = process.env.JWT_SECRET || 'default-secret';
    this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET || 'default-refresh-secret';
    this.accessTokenExpiry = process.env.JWT_ACCESS_EXPIRE || '15m';
    this.refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRE || '7d';
  }

  public static getInstance(): JWTService {
    if (!JWTService.instance) {
      JWTService.instance = new JWTService();
    }
    return JWTService.instance;
  }

  public generateTokens(payload: ITokenPayload): ITokenResponse {
    try {
      const accessToken = sign(
        { 
          userId: payload.userId,
          email: payload.email,
          firstName: payload.firstName,
          lastName: payload.lastName,
        },
        this.accessTokenSecret as any,
        { expiresIn: this.accessTokenExpiry as any } as any
      );

      const refreshToken = sign(
        { userId: payload.userId },
        this.refreshTokenSecret as any,
        { expiresIn: this.refreshTokenExpiry as any } as any
      );

      const accessTokenExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      const refreshTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      return {
        accessToken,
        refreshToken,
        accessTokenExpires,
        refreshTokenExpires,
      };
    } catch (error) {
      logger.error('Error generating tokens:', error);
      throw new AuthenticationError('Failed to generate authentication tokens');
    }
  }

  public verifyAccessToken(token: string): ITokenPayload {
    try {
      const decoded = verify(token, this.accessTokenSecret as Secret);
      if (typeof decoded === 'string') {
        throw new AuthenticationError('Invalid token format');
      }
      return {
        userId: decoded.userId,
        email: decoded.email,
        firstName: decoded.firstName,
        lastName: decoded.lastName,
      };
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new AuthenticationError('Access token expired');
      }
      if (error instanceof JsonWebTokenError) {
        throw new AuthenticationError('Invalid access token');
      }
      throw error;
    }
  }

  public verifyRefreshToken(token: string): { userId: string } {
    try {
      const decoded = verify(token, this.refreshTokenSecret as Secret);
      if (typeof decoded === 'string' || !decoded.userId) {
        throw new AuthenticationError('Invalid refresh token format');
      }
      return { userId: decoded.userId };
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new AuthenticationError('Refresh token expired');
      }
      if (error instanceof JsonWebTokenError) {
        throw new AuthenticationError('Invalid refresh token');
      }
      throw error;
    }
  }

  public generatePasswordResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  public generateEmailVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}