"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authMiddleware = void 0;
const jwt_service_1 = require("../services/jwt.service");
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new errors_1.AuthenticationError('No token provided');
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            throw new errors_1.AuthenticationError('Invalid token format');
        }
        const jwtService = jwt_service_1.JWTService.getInstance();
        const decoded = jwtService.verifyAccessToken(token);
        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            firstName: decoded.firstName,
            lastName: decoded.lastName,
        };
        next();
    }
    catch (error) {
        if (error instanceof errors_1.AuthenticationError) {
            res.status(401).json({
                success: false,
                error: {
                    message: error.message,
                    code: error.code || 'UNAUTHORIZED',
                },
            });
        }
        else {
            logger_1.logger.error('Auth middleware error:', error);
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
exports.authMiddleware = authMiddleware;
const authorize = (...roles) => {
    return (req, res, next) => {
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
        next();
    };
};
exports.authorize = authorize;
//# sourceMappingURL=auth.js.map