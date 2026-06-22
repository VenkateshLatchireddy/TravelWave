"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWTService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
class JWTService {
    static instance;
    accessTokenSecret;
    refreshTokenSecret;
    accessTokenExpiry;
    refreshTokenExpiry;
    constructor() {
        this.accessTokenSecret = process.env.JWT_SECRET || 'default-secret';
        this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET || 'default-refresh-secret';
        this.accessTokenExpiry = process.env.JWT_ACCESS_EXPIRE || '15m';
        this.refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRE || '7d';
    }
    static getInstance() {
        if (!JWTService.instance) {
            JWTService.instance = new JWTService();
        }
        return JWTService.instance;
    }
    generateTokens(payload) {
        try {
            const accessToken = jsonwebtoken_1.default.sign({
                userId: payload.userId,
                email: payload.email,
                firstName: payload.firstName,
                lastName: payload.lastName
            }, this.accessTokenSecret, { expiresIn: this.accessTokenExpiry });
            const refreshToken = jsonwebtoken_1.default.sign({ userId: payload.userId }, this.refreshTokenSecret, { expiresIn: this.refreshTokenExpiry });
            const accessTokenExpires = new Date(Date.now() + 15 * 60 * 1000);
            const refreshTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            return {
                accessToken,
                refreshToken,
                accessTokenExpires,
                refreshTokenExpires,
            };
        }
        catch (error) {
            logger_1.logger.error('Error generating tokens:', error);
            throw new errors_1.AuthenticationError('Failed to generate authentication tokens');
        }
    }
    verifyAccessToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, this.accessTokenSecret);
            if (typeof decoded === 'string') {
                throw new errors_1.AuthenticationError('Invalid token format');
            }
            return {
                userId: decoded.userId,
                email: decoded.email,
                firstName: decoded.firstName,
                lastName: decoded.lastName,
            };
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                throw new errors_1.AuthenticationError('Access token expired');
            }
            if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                throw new errors_1.AuthenticationError('Invalid access token');
            }
            throw error;
        }
    }
    verifyRefreshToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, this.refreshTokenSecret);
            if (typeof decoded === 'string' || !decoded.userId) {
                throw new errors_1.AuthenticationError('Invalid refresh token format');
            }
            return { userId: decoded.userId };
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                throw new errors_1.AuthenticationError('Refresh token expired');
            }
            if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                throw new errors_1.AuthenticationError('Invalid refresh token');
            }
            throw error;
        }
    }
    generatePasswordResetToken() {
        return crypto_1.default.randomBytes(32).toString('hex');
    }
    generateEmailVerificationToken() {
        return crypto_1.default.randomBytes(32).toString('hex');
    }
}
exports.JWTService = JWTService;
//# sourceMappingURL=jwt.service.js.map