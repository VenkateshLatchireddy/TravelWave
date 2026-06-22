export declare class PDFService {
    private static instance;
    private logoDataUri?;
    private constructor();
    static getInstance(): PDFService;
    generateTripPDF(trip: any): Promise<Buffer>;
    private getLogoDataUri;
    generateTripPDFBuffer(trip: any): Promise<Buffer>;
}
//# sourceMappingURL=pdf.service.d.ts.map