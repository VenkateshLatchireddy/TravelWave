import { Response } from 'express';
import { Trip } from '../models/Trip';
import { PDFService } from '../services/pdf.service';
import { EmailService } from '../services/email.service';
import { AuthRequest } from '../middleware/auth';
import { NotFoundError } from '../utils/errors';
import { logger } from '../utils/logger';

export class ExportController {
  private static instance: ExportController;
  private pdfService: PDFService;
  private emailService: EmailService;

  private constructor() {
    this.pdfService = PDFService.getInstance();
    this.emailService = EmailService.getInstance();
  }

  public static getInstance(): ExportController {
    if (!ExportController.instance) {
      ExportController.instance = new ExportController();
    }
    return ExportController.instance;
  }

  public exportPDF = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const trip = await Trip.findOne({ _id: id, userId });
      if (!trip) {
        throw new NotFoundError('Trip not found');
      }

      const pdfBuffer = await this.pdfService.generateTripPDF(trip);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=TravelWave-${trip.destination}-Itinerary.pdf`);
      res.send(pdfBuffer);
    } catch (error) {
      logger.error('Export PDF error:', error);
      throw error;
    }
  };

  public exportPDFAndEmail = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { email } = req.body;
      const userId = req.user!.userId;

      const trip = await Trip.findOne({ _id: id, userId });
      if (!trip) {
        throw new NotFoundError('Trip not found');
      }

      const pdfBuffer = await this.pdfService.generateTripPDF(trip);
      
      const user = { 
        firstName: req.user!.firstName,
        email: req.user!.email,
      };

      await this.emailService.sendTripExportEmail(user, trip, pdfBuffer, email);

      res.status(200).json({
        success: true,
        message: 'PDF sent to your email successfully',
      });
    } catch (error) {
      logger.error('Export PDF and email error:', error);
      throw error;
    }
  };

  public exportJSON = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const trip = await Trip.findOne({ _id: id, userId });
      if (!trip) {
        throw new NotFoundError('Trip not found');
      }

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=TravelWave-${trip.destination}-Itinerary.json`);
      res.json(trip);
    } catch (error) {
      logger.error('Export JSON error:', error);
      throw error;
    }
  };

  public generateShareablePDF = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { token } = req.params;

      const trip = await Trip.findOne({ shareToken: token, isPublic: true });
      if (!trip) {
        throw new NotFoundError('Shared trip not found');
      }

      const pdfBuffer = await this.pdfService.generateTripPDF(trip);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename=TravelWave-${trip.destination}-Itinerary.pdf`);
      res.send(pdfBuffer);
    } catch (error) {
      logger.error('Generate shareable PDF error:', error);
      throw error;
    }
  };
}