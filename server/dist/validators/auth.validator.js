"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateResetPassword = exports.validateForgotPassword = exports.validateRefreshToken = exports.validateLogin = exports.validateRegistration = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.refreshTokenSchema = exports.loginSchema = exports.registrationSchema = void 0;
const zod_1 = require("zod");
exports.registrationSchema = zod_1.z.object({
    email: zod_1.z
        .string()
        .email('Please enter a valid email address')
        .min(5, 'Email must be at least 5 characters')
        .max(255, 'Email cannot exceed 255 characters')
        .toLowerCase()
        .trim(),
    password: zod_1.z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .max(100, 'Password cannot exceed 100 characters')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    firstName: zod_1.z
        .string()
        .min(2, 'First name must be at least 2 characters')
        .max(50, 'First name cannot exceed 50 characters')
        .trim(),
    lastName: zod_1.z
        .string()
        .min(2, 'Last name must be at least 2 characters')
        .max(50, 'Last name cannot exceed 50 characters')
        .trim(),
});
exports.validateRegistration = exports.registrationSchema;
exports.loginSchema = zod_1.z.object({
    email: zod_1.z
        .string()
        .email('Please enter a valid email address')
        .toLowerCase()
        .trim(),
    password: zod_1.z.string().min(1, 'Password is required'),
});
exports.validateLogin = exports.loginSchema;
exports.refreshTokenSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1, 'Refresh token is required'),
});
exports.validateRefreshToken = exports.refreshTokenSchema;
exports.forgotPasswordSchema = zod_1.z.object({
    email: zod_1.z
        .string()
        .email('Please enter a valid email address')
        .toLowerCase()
        .trim(),
});
exports.validateForgotPassword = exports.forgotPasswordSchema;
exports.resetPasswordSchema = zod_1.z.object({
    password: zod_1.z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .max(100, 'Password cannot exceed 100 characters')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
});
exports.validateResetPassword = exports.resetPasswordSchema;
//# sourceMappingURL=auth.validator.js.map