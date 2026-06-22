"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const User_1 = require("../models/User");
const jwt_service_1 = require("../services/jwt.service");
const email_service_1 = require("../services/email.service");
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
class AuthController {
    static instance;
    jwtService;
    emailService;
    constructor() {
        this.jwtService = jwt_service_1.JWTService.getInstance();
        this.emailService = email_service_1.EmailService.getInstance();
    }
    static getInstance() {
        if (!AuthController.instance) {
            AuthController.instance = new AuthController();
        }
        return AuthController.instance;
    }
    register = async (req, res) => {
        try {
            const { email, password, firstName, lastName } = req.body;
            const existingUser = await User_1.User.findOne({ email });
            if (existingUser) {
                throw new errors_1.ConflictError('User with this email already exists');
            }
            const user = new User_1.User({
                email,
                password,
                firstName,
                lastName,
                isEmailVerified: false,
            });
            await user.save();
            const verificationToken = user.generateEmailVerificationToken();
            await user.save();
            this.emailService.sendWelcomeEmail(user, verificationToken).catch(err => {
                logger_1.logger.warn('Failed to send welcome email:', err.message);
            });
            logger_1.logger.info(`User registered: ${email}, verification token: ${verificationToken}`);
            const tokens = this.jwtService.generateTokens({
                userId: user._id.toString(),
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
            });
            res.status(201).json({
                success: true,
                data: {
                    user: {
                        id: user._id,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        isEmailVerified: user.isEmailVerified,
                    },
                    tokens,
                },
                message: 'Registration successful. Please verify your email.',
            });
        }
        catch (error) {
            logger_1.logger.error('Registration error:', error);
            throw error;
        }
    };
    login = async (req, res) => {
        try {
            const { email, password } = req.body;
            const user = await User_1.User.findOne({ email }).select('+password');
            if (!user) {
                throw new errors_1.AuthenticationError('Invalid email or password');
            }
            if (user.isAccountLocked()) {
                const lockTime = user.lockUntil ? user.lockUntil.getTime() - Date.now() : 0;
                throw new errors_1.AuthenticationError(`Account is locked. Please try again in ${Math.ceil(lockTime / 60000)} minutes`);
            }
            const isPasswordValid = await user.comparePassword(password);
            if (!isPasswordValid) {
                await user.incrementLoginAttempts();
                throw new errors_1.AuthenticationError('Invalid email or password');
            }
            await user.resetLoginAttempts();
            user.lastLoginAt = new Date();
            await user.save();
            const tokens = this.jwtService.generateTokens({
                userId: user._id.toString(),
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
            });
            res.status(200).json({
                success: true,
                data: {
                    user: {
                        id: user._id,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        isEmailVerified: user.isEmailVerified,
                    },
                    tokens,
                },
                message: 'Login successful',
            });
        }
        catch (error) {
            logger_1.logger.error('Login error:', error);
            throw error;
        }
    };
    refreshToken = async (req, res) => {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                throw new errors_1.ValidationError('Refresh token is required');
            }
            const decoded = this.jwtService.verifyRefreshToken(refreshToken);
            const user = await User_1.User.findById(decoded.userId);
            if (!user) {
                throw new errors_1.NotFoundError('User not found');
            }
            const tokens = this.jwtService.generateTokens({
                userId: user._id.toString(),
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
            });
            res.status(200).json({
                success: true,
                data: {
                    tokens,
                },
                message: 'Tokens refreshed successfully',
            });
        }
        catch (error) {
            logger_1.logger.error('Refresh token error:', error);
            throw error;
        }
    };
    logout = async (_req, res) => {
        try {
            res.status(200).json({
                success: true,
                message: 'Logged out successfully. Please clear your tokens.',
            });
        }
        catch (error) {
            logger_1.logger.error('Logout error:', error);
            throw error;
        }
    };
    verifyEmail = async (req, res) => {
        try {
            const { token } = req.params;
            if (!token) {
                throw new errors_1.ValidationError('Verification token is required');
            }
            const user = await User_1.User.findOne({
                emailVerificationToken: token,
                emailVerificationExpires: { $gt: new Date() },
            });
            if (!user) {
                throw new errors_1.NotFoundError('Invalid or expired verification token');
            }
            user.isEmailVerified = true;
            user.emailVerificationToken = undefined;
            user.emailVerificationExpires = undefined;
            await user.save();
            res.status(200).json({
                success: true,
                message: 'Email verified successfully',
            });
        }
        catch (error) {
            logger_1.logger.error('Email verification error:', error);
            throw error;
        }
    };
    forgotPassword = async (req, res) => {
        try {
            const { email } = req.body;
            if (!email) {
                throw new errors_1.ValidationError('Email is required');
            }
            const user = await User_1.User.findOne({ email });
            if (!user) {
                res.status(200).json({
                    success: true,
                    message: 'If an account exists with this email, a password reset link has been sent',
                });
                return;
            }
            const resetToken = user.generatePasswordResetToken();
            await user.save();
            this.emailService.sendPasswordResetEmail(user, resetToken).catch(err => {
                logger_1.logger.warn('Failed to send password reset email:', err.message);
            });
            logger_1.logger.info(`Password reset token generated for ${email}`);
            res.status(200).json({
                success: true,
                message: 'If an account exists with this email, a password reset link has been sent',
            });
        }
        catch (error) {
            logger_1.logger.error('Forgot password error:', error);
            throw error;
        }
    };
    resetPassword = async (req, res) => {
        try {
            const { token } = req.params;
            const { password } = req.body;
            if (!token) {
                throw new errors_1.ValidationError('Reset token is required');
            }
            if (!password || password.length < 8) {
                throw new errors_1.ValidationError('Password must be at least 8 characters long');
            }
            const crypto = require('crypto');
            const hashedToken = crypto
                .createHash('sha256')
                .update(token)
                .digest('hex');
            const user = await User_1.User.findOne({
                resetPasswordToken: hashedToken,
                resetPasswordExpires: { $gt: new Date() },
            });
            if (!user) {
                throw new errors_1.NotFoundError('Invalid or expired reset token');
            }
            user.password = password;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();
            this.emailService.sendPasswordResetConfirmation(user).catch(err => {
                logger_1.logger.warn('Failed to send reset confirmation email:', err.message);
            });
            res.status(200).json({
                success: true,
                message: 'Password reset successfully',
            });
        }
        catch (error) {
            logger_1.logger.error('Reset password error:', error);
            throw error;
        }
    };
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map