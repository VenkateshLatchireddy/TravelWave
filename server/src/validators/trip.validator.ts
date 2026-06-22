import { z } from 'zod';

export const activitySchema = z.object({
  title: z.string().min(1, 'Activity title is required'),
  description: z.string().optional(),
  estimatedCostINR: z.number().min(0, 'Cost cannot be negative').default(0),
  timeOfDay: z.enum(['Morning', 'Afternoon', 'Evening']).optional(),
  location: z.string().optional(),
  duration: z.string().optional(),
  isCustom: z.boolean().default(false),
});

export const itineraryDaySchema = z.object({
  dayNumber: z.number().int().positive('Day number must be positive'),
  title: z.string().optional(),
  date: z.date().optional(),
  activities: z.array(activitySchema).default([]),
});

export const hotelSchema = z.object({
  name: z.string().min(1, 'Hotel name is required'),
  tier: z.enum(['Budget', 'Mid-Range', 'Luxury']),
  estimatedCostNightINR: z.number().min(0, 'Cost cannot be negative'),
  rating: z.string().optional(),
  location: z.string().optional(),
  amenities: z.array(z.string()).default([]),
});

export const estimatedBudgetSchema = z.object({
  transport: z.number().min(0).default(0),
  accommodation: z.number().min(0).default(0),
  food: z.number().min(0).default(0),
  activities: z.number().min(0).default(0),
  miscellaneous: z.number().min(0).default(0),
  total: z.number().min(0).default(0),
  currency: z.literal('INR').default('INR'),
});

export const packingItemSchema = z.object({
  item: z.string().min(1, 'Item name is required'),
  category: z.enum(['Documents', 'Clothing', 'Gear', 'Electronics', 'Health', 'Other']),
  isPacked: z.boolean().default(false),
  quantity: z.number().int().min(1).default(1),
  notes: z.string().optional(),
});

const parseDate = z.preprocess((value) => {
  if (typeof value === 'string' && value.length > 0) {
    const date = new Date(value);
    return isNaN(date.getTime()) ? undefined : date;
  }
  if (value instanceof Date) {
    return value;
  }
  return undefined;
}, z.date().optional());

export const tripGenerationSchema = z.object({
  destination: z.string()
    .min(2, 'Destination is required')
    .max(100, 'Destination too long'),
  durationDays: z.number()
    .int()
    .min(1, 'Duration must be at least 1 day')
    .max(30, 'Duration cannot exceed 30 days'),
  budgetTier: z.enum(['Low', 'Medium', 'High']),
  interests: z.array(z.string()).default([]),
  travelDates: z.object({
    start: parseDate,
    end: parseDate,
  }).optional(),
});

export const tripUpdateSchema = z.object({
  itinerary: z.array(itineraryDaySchema).optional(),
  hotels: z.array(hotelSchema).optional(),
  estimatedBudget: estimatedBudgetSchema.partial().optional(),
  packingList: z.array(packingItemSchema).optional(),
  isPublic: z.boolean().optional(),
  interests: z.array(z.string()).optional(),
  status: z.enum(['Draft', 'Generated', 'Modified', 'Shared']).optional(),
});

export const addActivitySchema = z.object({
  dayNumber: z.number().int().positive(),
  activity: activitySchema,
});

export const removeActivitySchema = z.object({
  dayNumber: z.number().int().positive(),
  activityIndex: z.number().int().min(0),
});

export const regenerateDaySchema = z.object({
  dayNumber: z.number().int().positive(),
  feedback: z.string().optional(),
});

export { tripGenerationSchema as validateTripGeneration };
export { tripUpdateSchema as validateTripUpdate };
export { addActivitySchema as validateAddActivity };
export { removeActivitySchema as validateRemoveActivity };
export { regenerateDaySchema as validateRegenerateDay };