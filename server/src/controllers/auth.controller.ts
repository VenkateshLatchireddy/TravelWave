import { Request, Response } from 'express';
import { User } from '../models/User';
import { JWTService } from '../services/jwt.service';
import { EmailService } from '../services/email.service';
import { 
  ValidationError,
  AuthenticationError, 
  ConflictError,
  NotFoundError 
} from '../utils/errors';
import { logger } from '../utils/logger';

export class AuthController {
  private static instance: AuthController;
  private jwtService: JWTService;
  private emailService: EmailService;

  private constructor() {
    this.jwtService = JWTService.getInstance();
    this.emailService = EmailService.getInstance();
  }

  public static getInstance(): AuthController {
    if (!AuthController.instance) {
      AuthController.instance = new AuthController();
    }
    return AuthController.instance;
  }

  public register = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validation is already done by middleware
      const { email, password, firstName, lastName } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new ConflictError('User with this email already exists');
      }

      // Create new user
      const user = new User({
        email,
        password,
        firstName,
        lastName,
        isEmailVerified: false,
      });

      await user.save();

      // Generate email verification token
      const verificationToken = user.generateEmailVerificationToken();
      await user.save();

      // ✅ SEND WELCOME & VERIFICATION EMAIL (Non-blocking - don't await)
      this.emailService.sendWelcomeEmail(user, verificationToken).catch(err => {
        logger.warn('Failed to send welcome email:', err.message);
      });

      logger.info(`User registered: ${email}, verification token: ${verificationToken}`);

      // Generate JWT tokens
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
    } catch (error) {
      logger.error('Registration error:', error);
      throw error;
    }
  };

  public login = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validation is already done by middleware
      const { email, password } = req.body;

      // Find user with password field
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        throw new AuthenticationError('Invalid email or password');
      }

      // Check if account is locked
      if (user.isAccountLocked()) {
        const lockTime = user.lockUntil ? user.lockUntil.getTime() - Date.now() : 0;
        throw new AuthenticationError(
          `Account is locked. Please try again in ${Math.ceil(lockTime / 60000)} minutes`
        );
      }

      // Compare password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        await user.incrementLoginAttempts();
        throw new AuthenticationError('Invalid email or password');
      }

      // Reset login attempts on successful login
      await user.resetLoginAttempts();

      // Update last login
      user.lastLoginAt = new Date();
      await user.save();

      // Generate JWT tokens
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
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  };

  public refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        throw new ValidationError('Refresh token is required');
      }

      // Verify refresh token
      const decoded = this.jwtService.verifyRefreshToken(refreshToken);

      // Find user
      const user = await User.findById(decoded.userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Generate new tokens
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
    } catch (error) {
      logger.error('Refresh token error:', error);
      throw error;
    }
  };

  public logout = async (_req: Request, res: Response): Promise<void> => {
    try {
      // In a stateless JWT system, we can't invalidate tokens server-side
      // Client should discard the tokens
      res.status(200).json({
        success: true,
        message: 'Logged out successfully. Please clear your tokens.',
      });
    } catch (error) {
      logger.error('Logout error:', error);
      throw error;
    }
  };

  public verifyEmail = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token } = req.params;
      if (!token) {
        throw new ValidationError('Verification token is required');
      }

      // Find user with verification token
      const user = await User.findOne({
        emailVerificationToken: token,
        emailVerificationExpires: { $gt: new Date() },
      });

      if (!user) {
        throw new NotFoundError('Invalid or expired verification token');
      }

      // Update user verification status
      user.isEmailVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Email verified successfully',
      });
    } catch (error) {
      logger.error('Email verification error:', error);
      throw error;
    }
  };

  public forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;
      if (!email) {
        throw new ValidationError('Email is required');
      }

      const user = await User.findOne({ email });
      if (!user) {
        // Don't reveal that user doesn't exist for security
        res.status(200).json({
          success: true,
          message: 'If an account exists with this email, a password reset link has been sent',
        });
        return;
      }

      // Generate reset token
      const resetToken = user.generatePasswordResetToken();
      await user.save();

      // ✅ SEND PASSWORD RESET EMAIL (Non-blocking)
      this.emailService.sendPasswordResetEmail(user, resetToken).catch(err => {
        logger.warn('Failed to send password reset email:', err.message);
      });

      logger.info(`Password reset token generated for ${email}`);

      res.status(200).json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent',
      });
    } catch (error) {
      logger.error('Forgot password error:', error);
      throw error;
    }
  };

  public resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token } = req.params;
      const { password } = req.body;

      if (!token) {
        throw new ValidationError('Reset token is required');
      }

      if (!password || password.length < 8) {
        throw new ValidationError('Password must be at least 8 characters long');
      }

      // Import crypto for hashing
      const crypto = require('crypto');
      
      // Hash the token to match what's stored in DB
      const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

      // Find user with reset token
      const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: new Date() },
      });

      if (!user) {
        throw new NotFoundError('Invalid or expired reset token');
      }

      // Update password
      user.password = password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      // ✅ SEND CONFIRMATION EMAIL (Optional)
      this.emailService.sendPasswordResetConfirmation(user).catch(err => {
        logger.warn('Failed to send reset confirmation email:', err.message);
      });

      res.status(200).json({
        success: true,
        message: 'Password reset successfully',
      });
    } catch (error) {
      logger.error('Reset password error:', error);
      throw error;
    }
  };
}