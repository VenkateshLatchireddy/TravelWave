"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_1 = require("../middleware/auth");
const asyncHandler_1 = require("../middleware/asyncHandler");
const rateLimiter_1 = require("../middleware/rateLimiter");
const validateRequest_1 = require("../middleware/validateRequest");
const auth_validator_1 = require("../validators/auth.validator");
const router = (0, express_1.Router)();
const authController = auth_controller_1.AuthController.getInstance();
router.post('/register', (0, rateLimiter_1.rateLimiter)({ windowMs: 15 * 60 * 1000, max: 5 }), (0, validateRequest_1.validateRequest)(auth_validator_1.validateRegistration), (0, asyncHandler_1.asyncHandler)(authController.register));
router.post('/login', (0, rateLimiter_1.rateLimiter)({ windowMs: 15 * 60 * 1000, max: 10 }), (0, validateRequest_1.validateRequest)(auth_validator_1.validateLogin), (0, asyncHandler_1.asyncHandler)(authController.login));
router.post('/refresh-token', (0, rateLimiter_1.rateLimiter)({ windowMs: 15 * 60 * 1000, max: 5 }), (0, validateRequest_1.validateRequest)(auth_validator_1.validateRefreshToken), (0, asyncHandler_1.asyncHandler)(authController.refreshToken));
router.post('/forgot-password', (0, rateLimiter_1.rateLimiter)({ windowMs: 15 * 60 * 1000, max: 3 }), (0, validateRequest_1.validateRequest)(auth_validator_1.validateForgotPassword), (0, asyncHandler_1.asyncHandler)(authController.forgotPassword));
router.post('/reset-password/:token', (0, rateLimiter_1.rateLimiter)({ windowMs: 15 * 60 * 1000, max: 3 }), (0, validateRequest_1.validateRequest)(auth_validator_1.validateResetPassword), (0, asyncHandler_1.asyncHandler)(authController.resetPassword));
router.get('/verify-email/:token', (0, asyncHandler_1.asyncHandler)(authController.verifyEmail));
router.post('/logout', auth_1.authMiddleware, (0, asyncHandler_1.asyncHandler)(authController.logout));
router.get('/me', auth_1.authMiddleware, async (req, res) => {
    res.status(200).json({
        success: true,
        data: {
            user: req.user,
        },
    });
});
exports.default = router;
//# sourceMappingURL=auth.routes.js.map