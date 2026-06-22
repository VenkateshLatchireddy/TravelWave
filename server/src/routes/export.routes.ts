import { Router } from 'express';
import { ExportController } from '../controllers/export.controller';
import { authMiddleware } from '../middleware/auth';
import { rateLimiter } from '../middleware/rateLimiter';

const router = Router();
const exportController = ExportController.getInstance();

// Protected routes
router.use(authMiddleware);

// Export PDF
router.get(
  '/:id/pdf',
  rateLimiter({ windowMs: 60 * 1000, max: 5 }), // 5 per minute
  exportController.exportPDF
);

// Export PDF and email
router.post(
  '/:id/email',
  rateLimiter({ windowMs: 60 * 1000, max: 3 }), // 3 per minute
  exportController.exportPDFAndEmail
);

// Export JSON
router.get(
  '/:id/json',
  rateLimiter({ windowMs: 60 * 1000, max: 5 }),
  exportController.exportJSON
);

// Public shared PDF (no auth required)
router.get('/shared/:token/pdf', exportController.generateShareablePDF);

export default router;