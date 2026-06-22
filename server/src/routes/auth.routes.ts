import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';
import { rateLimiter } from '../middleware/rateLimiter';
import { validateRequest } from '../middleware/validateRequest';
import {
  validateRegistration,
  validateLogin,
  validateRefreshToken,
  validateForgotPassword,
  validateResetPassword,
} from '../validators/auth.validator';

const router = Router();
const authController = AuthController.getInstance();

// Public routes with rate limiting
router.post(
  '/register',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 5 }),
  validateRequest(validateRegistration),
  asyncHandler(authController.register)
);

router.post(
  '/login',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 10 }),
  validateRequest(validateLogin),
  asyncHandler(authController.login)
);

router.post(
  '/refresh-token',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 5 }),
  validateRequest(validateRefreshToken),
  asyncHandler(authController.refreshToken)
);

router.post(
  '/forgot-password',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 3 }),
  validateRequest(validateForgotPassword),
  asyncHandler(authController.forgotPassword)
);

router.post(
  '/reset-password/:token',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 3 }),
  validateRequest(validateResetPassword),
  asyncHandler(authController.resetPassword)
);

router.get('/verify-email/:token', asyncHandler(authController.verifyEmail));

// Protected routes
router.post('/logout', authMiddleware, asyncHandler(authController.logout));

// Get current user profile
router.get('/me', authMiddleware, async (req: any, res: any) => {
  res.status(200).json({
    success: true,
    data: {
      user: req.user,
    },
  });
});

export default router;
