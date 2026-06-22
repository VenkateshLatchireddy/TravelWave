export declare class EmailService {
    private static instance;
    private transporter;
    private isConfigured;
    private constructor();
    private initializeTransporter;
    static getInstance(): EmailService;
    private sendEmail;
    sendWelcomeEmail(user: any, verificationToken: string): Promise<void>;
    sendPasswordResetEmail(user: any, resetToken: string): Promise<void>;
    sendTripShareEmail(user: any, trip: any, shareUrl: string, recipientEmail?: string): Promise<void>;
    sendTripExportEmail(user: any, trip: any, pdfBuffer: Buffer, recipientEmail?: string): Promise<void>;
    sendPasswordResetConfirmation(user: any): Promise<void>;
}
//# sourceMappingURL=email.service.d.ts.map