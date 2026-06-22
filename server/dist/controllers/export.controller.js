"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportController = void 0;
const Trip_1 = require("../models/Trip");
const pdf_service_1 = require("../services/pdf.service");
const email_service_1 = require("../services/email.service");
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
class ExportController {
    static instance;
    pdfService;
    emailService;
    constructor() {
        this.pdfService = pdf_service_1.PDFService.getInstance();
        this.emailService = email_service_1.EmailService.getInstance();
    }
    static getInstance() {
        if (!ExportController.instance) {
            ExportController.instance = new ExportController();
        }
        return ExportController.instance;
    }
    exportPDF = async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.userId;
            const trip = await Trip_1.Trip.findOne({ _id: id, userId });
            if (!trip) {
                throw new errors_1.NotFoundError('Trip not found');
            }
            const pdfBuffer = await this.pdfService.generateTripPDF(trip);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=TravelWave-${trip.destination}-Itinerary.pdf`);
            res.send(pdfBuffer);
        }
        catch (error) {
            logger_1.logger.error('Export PDF error:', error);
            throw error;
        }
    };
    exportPDFAndEmail = async (req, res) => {
        try {
            const { id } = req.params;
            const { email } = req.body;
            const userId = req.user.userId;
            const trip = await Trip_1.Trip.findOne({ _id: id, userId });
            if (!trip) {
                throw new errors_1.NotFoundError('Trip not found');
            }
            const pdfBuffer = await this.pdfService.generateTripPDF(trip);
            const user = {
                firstName: req.user.firstName,
                email: req.user.email,
            };
            await this.emailService.sendTripExportEmail(user, trip, pdfBuffer, email);
            res.status(200).json({
                success: true,
                message: 'PDF sent to your email successfully',
            });
        }
        catch (error) {
            logger_1.logger.error('Export PDF and email error:', error);
            throw error;
        }
    };
    exportJSON = async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.userId;
            const trip = await Trip_1.Trip.findOne({ _id: id, userId });
            if (!trip) {
                throw new errors_1.NotFoundError('Trip not found');
            }
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename=TravelWave-${trip.destination}-Itinerary.json`);
            res.json(trip);
        }
        catch (error) {
            logger_1.logger.error('Export JSON error:', error);
            throw error;
        }
    };
    generateShareablePDF = async (req, res) => {
        try {
            const { token } = req.params;
            const trip = await Trip_1.Trip.findOne({ shareToken: token, isPublic: true });
            if (!trip) {
                throw new errors_1.NotFoundError('Shared trip not found');
            }
            const pdfBuffer = await this.pdfService.generateTripPDF(trip);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `inline; filename=TravelWave-${trip.destination}-Itinerary.pdf`);
            res.send(pdfBuffer);
        }
        catch (error) {
            logger_1.logger.error('Generate shareable PDF error:', error);
            throw error;
        }
    };
}
exports.ExportController = ExportController;
//# sourceMappingURL=export.controller.js.map