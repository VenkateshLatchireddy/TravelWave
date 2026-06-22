"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const logger_1 = require("../utils/logger");
const errors_1 = require("../utils/errors");
const mongoose_1 = __importDefault(require("mongoose"));
const errorHandler = (err, req, res, next) => {
    logger_1.logger.error('Error occurred:', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        ip: req.ip,
    });
    if (err instanceof mongoose_1.default.Error.ValidationError) {
        const messages = Object.values(err.errors).map(e => e.message);
        res.status(400).json({
            success: false,
            error: {
                message: 'Validation failed',
                details: messages,
                code: 'VALIDATION_ERROR',
            },
        });
        return;
    }
    if (err instanceof mongoose_1.default.Error.CastError) {
        res.status(400).json({
            success: false,
            error: {
                message: 'Invalid ID format',
                code: 'INVALID_ID',
            },
        });
        return;
    }
    if (err.name === 'MongoError' && err.code === 11000) {
        res.status(409).json({
            success: false,
            error: {
                message: 'Duplicate key error',
                code: 'DUPLICATE_KEY',
            },
        });
        return;
    }
    if (err.name === 'JsonWebTokenError') {
        res.status(401).json({
            success: false,
            error: {
                message: 'Invalid token',
                code: 'INVALID_TOKEN',
            },
        });
        return;
    }
    if (err.name === 'TokenExpiredError') {
        res.status(401).json({
            success: false,
            error: {
                message: 'Token expired',
                code: 'TOKEN_EXPIRED',
            },
        });
        return;
    }
    if (err instanceof errors_1.AppError) {
        res.status(err.statusCode).json({
            success: false,
            error: {
                message: err.message,
                code: err.code || 'APP_ERROR',
            },
        });
        return;
    }
    res.status(500).json({
        success: false,
        error: {
            message: process.env.NODE_ENV === 'production'
                ? 'Internal server error'
                : err.message,
            code: 'INTERNAL_SERVER_ERROR',
        },
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map