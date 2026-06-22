import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare class ExportController {
    private static instance;
    private pdfService;
    private emailService;
    private constructor();
    static getInstance(): ExportController;
    exportPDF: (req: AuthRequest, res: Response) => Promise<void>;
    exportPDFAndEmail: (req: AuthRequest, res: Response) => Promise<void>;
    exportJSON: (req: AuthRequest, res: Response) => Promise<void>;
    generateShareablePDF: (req: AuthRequest, res: Response) => Promise<void>;
}
//# sourceMappingURL=export.controller.d.ts.map