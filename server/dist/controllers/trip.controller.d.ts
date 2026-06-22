import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare class TripController {
    private static instance;
    private geminiService;
    private constructor();
    static getInstance(): TripController;
    generateTrip: (req: AuthRequest, res: Response) => Promise<void>;
    getTrips: (req: AuthRequest, res: Response) => Promise<void>;
    getTripById: (req: AuthRequest, res: Response) => Promise<void>;
    updateTrip: (req: AuthRequest, res: Response) => Promise<void>;
    deleteTrip: (req: AuthRequest, res: Response) => Promise<void>;
    addActivity: (req: AuthRequest, res: Response) => Promise<void>;
    removeActivity: (req: AuthRequest, res: Response) => Promise<void>;
    regenerateDay: (req: AuthRequest, res: Response) => Promise<void>;
    updatePackingList: (req: AuthRequest, res: Response) => Promise<void>;
    togglePackingItem: (req: AuthRequest, res: Response) => Promise<void>;
    generatePackingList: (req: AuthRequest, res: Response) => Promise<void>;
    shareTrip: (req: AuthRequest, res: Response) => Promise<void>;
    getSharedTrip: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=trip.controller.d.ts.map