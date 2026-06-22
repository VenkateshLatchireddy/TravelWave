import { Router } from 'express';
import { TripController } from '../controllers/trip.controller';
import { authMiddleware } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';
import { rateLimiter } from '../middleware/rateLimiter';
import { validateRequest } from '../middleware/validateRequest';
import {
  validateTripGeneration,
  validateTripUpdate,
  validateAddActivity,
  validateRemoveActivity,
  validateRegenerateDay,
} from '../validators/trip.validator';

const router = Router();
const tripController = TripController.getInstance();

// All trip routes require authentication
router.use(authMiddleware);

// Trip generation (AI heavy - stricter rate limit)
router.post(
  '/generate',
  rateLimiter({ windowMs: 5 * 60 * 1000, max: 3 }), // 3 requests per 5 minutes
  validateRequest(validateTripGeneration),
  asyncHandler(tripController.generateTrip)
);

// Get all trips (paginated)
router.get('/', asyncHandler(tripController.getTrips));

// Get single trip
router.get('/:id', asyncHandler(tripController.getTripById));

// Update trip
router.put(
  '/:id',
  validateRequest(validateTripUpdate),
  asyncHandler(tripController.updateTrip)
);

// Delete trip
router.delete('/:id', asyncHandler(tripController.deleteTrip));

// Activity operations
router.post(
  '/:id/activities',
  validateRequest(validateAddActivity),
  asyncHandler(tripController.addActivity)
);

router.delete(
  '/:id/activities',
  validateRequest(validateRemoveActivity),
  asyncHandler(tripController.removeActivity)
);

// Regenerate specific day
router.put(
  '/:id/regenerate-day',
  validateRequest(validateRegenerateDay),
  asyncHandler(tripController.regenerateDay)
);

// Packing list operations
router.put('/:id/packing', asyncHandler(tripController.updatePackingList));
router.put('/:id/packing/toggle/:itemId', asyncHandler(tripController.togglePackingItem));
router.post('/:id/packing/regenerate', asyncHandler(tripController.generatePackingList));

// Share trip
router.post('/:id/share', asyncHandler(tripController.shareTrip));

// Public shared trip (no auth required - separate route)
// We'll add this to the main router

export default router;
