import { Request, Response } from 'express';
import { Trip } from '../models/Trip';
import { GeminiService } from '../services/gemini.service';
import { AuthRequest } from '../middleware/auth';
import { NotFoundError, ValidationError } from '../utils/errors';
import { logger } from '../utils/logger';

export class TripController {
  private static instance: TripController;
  private geminiService: GeminiService;

  private constructor() {
    this.geminiService = GeminiService.getInstance();
  }

  public static getInstance(): TripController {
    if (!TripController.instance) {
      TripController.instance = new TripController();
    }
    return TripController.instance;
  }

  public generateTrip = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      console.log('=== TRIP GENERATION STARTED ===');
      console.log('User ID:', req.user?.userId);
      console.log('Request body:', req.body);

      const { destination, durationDays, budgetTier, interests, travelDates } = req.body;
      const userId = req.user!.userId;

      if (!process.env.GEMINI_API_KEY) {
        console.error('GEMINI_API_KEY is missing!');
        throw new Error('AI service is not configured');
      }

      logger.info(`Generating trip for user ${userId} to ${destination}`);

      // Generate trip plan using AI
      console.log('Calling Gemini service to generate trip plan...');
      const aiResponse = await this.geminiService.generateTripPlan({
        destination,
        durationDays,
        budgetTier,
        interests: interests || [],
        travelDates,
      });
      console.log('AI response received:', JSON.stringify(aiResponse).substring(0, 200));

      // Create trip document
      const trip = new Trip({
        userId,
        destination,
        durationDays,
        budgetTier,
        interests: interests || [],
        travelDates: travelDates || {},
        itinerary: aiResponse.itinerary,
        hotels: aiResponse.hotels,
        estimatedBudget: aiResponse.estimatedBudget,
        packingList: aiResponse.packingList,
        status: 'Generated',
        isPublic: false,
        viewCount: 0,
      });

      await trip.save();

      res.status(201).json({
        success: true,
        data: trip,
        message: 'Trip generated successfully',
      });
    } catch (error) {
      console.error('Trip generation error:', error);
      logger.error('Trip generation error:', error);
      throw error;
    }
  };

  public getTrips = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { status, limit = 10, page = 1 } = req.query;

      const query: any = { userId };
      if (status) {
        query.status = status;
      }

      const skip = (Number(page) - 1) * Number(limit);

      const [trips, total] = await Promise.all([
        Trip.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit)),
        Trip.countDocuments(query),
      ]);

      res.status(200).json({
        success: true,
        data: {
          trips,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit)),
          },
        },
      });
    } catch (error) {
      logger.error('Get trips error:', error);
      throw error;
    }
  };

  public getTripById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const trip = await Trip.findOne({ _id: id, userId });
      if (!trip) {
        throw new NotFoundError('Trip not found');
      }

      // Increment view count
      trip.viewCount += 1;
      await trip.save();

      res.status(200).json({
        success: true,
        data: trip,
      });
    } catch (error) {
      logger.error('Get trip by id error:', error);
      throw error;
    }
  };

  public updateTrip = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const trip = await Trip.findOne({ _id: id, userId });
      if (!trip) {
        throw new NotFoundError('Trip not found');
      }

      const updates = req.body;
      
      // Update only allowed fields
      if (updates.itinerary) {
        trip.itinerary = updates.itinerary;
        trip.status = 'Modified';
      }
      
      if (updates.hotels) {
        trip.hotels = updates.hotels;
      }
      
      if (updates.estimatedBudget) {
        trip.estimatedBudget = {
          ...trip.estimatedBudget,
          ...updates.estimatedBudget,
        };
      }
      
      if (updates.packingList) {
        trip.packingList = updates.packingList;
      }

      if (updates.isPublic !== undefined) {
        trip.isPublic = updates.isPublic;
      }

      if (updates.interests) {
        trip.interests = updates.interests;
      }

      await trip.save();

      res.status(200).json({
        success: true,
        data: trip,
        message: 'Trip updated successfully',
      });
    } catch (error) {
      logger.error('Update trip error:', error);
      throw error;
    }
  };

  public deleteTrip = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const trip = await Trip.findOneAndDelete({ _id: id, userId });
      if (!trip) {
        throw new NotFoundError('Trip not found');
      }

      res.status(200).json({
        success: true,
        message: 'Trip deleted successfully',
      });
    } catch (error) {
      logger.error('Delete trip error:', error);
      throw error;
    }
  };

  public addActivity = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { dayNumber, activity } = req.body;
      const userId = req.user!.userId;

      if (!dayNumber || !activity) {
        throw new ValidationError('Day number and activity are required');
      }

      const trip = await Trip.findOne({ _id: id, userId });
      if (!trip) {
        throw new NotFoundError('Trip not found');
      }

      const day = trip.itinerary.find(d => d.dayNumber === dayNumber);
      if (!day) {
        throw new NotFoundError(`Day ${dayNumber} not found`);
      }

      // Add activity with custom flag
      activity.isCustom = true;
      day.activities.push(activity);
      trip.status = 'Modified';

      await trip.save();

      res.status(200).json({
        success: true,
        data: trip,
        message: 'Activity added successfully',
      });
    } catch (error) {
      logger.error('Add activity error:', error);
      throw error;
    }
  };

  public removeActivity = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { dayNumber, activityIndex } = req.body;
      const userId = req.user!.userId;

      if (dayNumber === undefined || activityIndex === undefined) {
        throw new ValidationError('Day number and activity index are required');
      }

      const trip = await Trip.findOne({ _id: id, userId });
      if (!trip) {
        throw new NotFoundError('Trip not found');
      }

      const day = trip.itinerary.find(d => d.dayNumber === dayNumber);
      if (!day) {
        throw new NotFoundError(`Day ${dayNumber} not found`);
      }

      if (activityIndex < 0 || activityIndex >= day.activities.length) {
        throw new ValidationError('Invalid activity index');
      }

      day.activities.splice(activityIndex, 1);
      trip.status = 'Modified';

      await trip.save();

      res.status(200).json({
        success: true,
        data: trip,
        message: 'Activity removed successfully',
      });
    } catch (error) {
      logger.error('Remove activity error:', error);
      throw error;
    }
  };

  public regenerateDay = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { dayNumber, feedback } = req.body;
      const userId = req.user!.userId;

      if (!dayNumber) {
        throw new ValidationError('Day number is required');
      }

      const trip = await Trip.findOne({ _id: id, userId });
      if (!trip) {
        throw new NotFoundError('Trip not found');
      }

      const dayIndex = trip.itinerary.findIndex(d => d.dayNumber === dayNumber);
      if (dayIndex === -1) {
        throw new NotFoundError(`Day ${dayNumber} not found`);
      }

      // Generate new day using AI
      const aiResponse = await this.geminiService.regenerateSpecificDay(
        trip,
        dayNumber,
        feedback || 'Make it more interesting'
      );

      // Update the specific day
      trip.itinerary[dayIndex] = {
        ...trip.itinerary[dayIndex],
        ...aiResponse,
      };
      trip.status = 'Modified';

      await trip.save();

      res.status(200).json({
        success: true,
        data: trip,
        message: `Day ${dayNumber} regenerated successfully`,
      });
    } catch (error) {
      logger.error('Regenerate day error:', error);
      throw error;
    }
  };

  public updatePackingList = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { packingList } = req.body;
      const userId = req.user!.userId;

      if (!packingList || !Array.isArray(packingList)) {
        throw new ValidationError('Valid packing list is required');
      }

      const trip = await Trip.findOne({ _id: id, userId });
      if (!trip) {
        throw new NotFoundError('Trip not found');
      }

      trip.packingList = packingList;
      await trip.save();

      res.status(200).json({
        success: true,
        data: trip,
        message: 'Packing list updated successfully',
      });
    } catch (error) {
      logger.error('Update packing list error:', error);
      throw error;
    }
  };

  public togglePackingItem = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { itemId } = req.params;
      const userId = req.user!.userId;

      const trip = await Trip.findOne({ _id: id, userId });
      if (!trip) {
        throw new NotFoundError('Trip not found');
      }

      const item = trip.packingList.find(p => p._id?.toString() === itemId);
      if (!item) {
        throw new NotFoundError('Packing item not found');
      }

      item.isPacked = !item.isPacked;
      await trip.save();

      res.status(200).json({
        success: true,
        data: trip,
        message: `Packing item ${item.isPacked ? 'checked' : 'unchecked'} successfully`,
      });
    } catch (error) {
      logger.error('Toggle packing item error:', error);
      throw error;
    }
  };

  public generatePackingList = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const trip = await Trip.findOne({ _id: id, userId });
      if (!trip) {
        throw new NotFoundError('Trip not found');
      }

      // Generate new packing list using AI
      const newPackingList = await this.geminiService.generatePackingList(trip);
      if (newPackingList.length === 0) {
        throw new ValidationError('Could not generate packing list. Please try again.');
      }
      
      trip.packingList = newPackingList;
      await trip.save();

      res.status(200).json({
        success: true,
        data: trip,
        message: 'Packing list regenerated successfully',
      });
    } catch (error) {
      logger.error('Generate packing list error:', error);
      throw error;
    }
  };

  public shareTrip = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const trip = await Trip.findOne({ _id: id, userId });
      if (!trip) {
        throw new NotFoundError('Trip not found');
      }

      // Generate share token
      const shareToken = require('crypto').randomBytes(16).toString('hex');
      trip.shareToken = shareToken;
      trip.isPublic = true;
      await trip.save();

      const shareUrl = `${process.env.FRONTEND_URL}/shared/${shareToken}`;

      res.status(200).json({
        success: true,
        data: {
          shareUrl,
          shareToken: trip.shareToken,
        },
        message: 'Trip shared successfully',
      });
    } catch (error) {
      logger.error('Share trip error:', error);
      throw error;
    }
  };

  public getSharedTrip = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token } = req.params;

      const trip = await Trip.findOne({ shareToken: token, isPublic: true });
      if (!trip) {
        throw new NotFoundError('Shared trip not found');
      }

      // Increment view count
      trip.viewCount += 1;
      await trip.save();

      // Remove sensitive data
      const tripData = trip.toJSON();
      delete (tripData as any).userId;

      res.status(200).json({
        success: true,
        data: tripData,
      });
    } catch (error) {
      logger.error('Get shared trip error:', error);
      throw error;
    }
  };
}
