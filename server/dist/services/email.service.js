"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const logger_1 = require("../utils/logger");
const errors_1 = require("../utils/errors");
class EmailService {
    static instance;
    transporter;
    isConfigured;
    constructor() {
        this.isConfigured = false;
        this.initializeTransporter();
    }
    initializeTransporter() {
        const host = process.env.SMTP_HOST;
        const port = parseInt(process.env.SMTP_PORT || '587');
        const user = process.env.SMTP_USER;
        const pass = process.env.SMTP_PASS ? process.env.SMTP_PASS.replace(/\s/g, '') : undefined;
        if (!host || !user || !pass) {
            logger_1.logger.warn('Email service not configured. Emails will be logged instead.');
            this.isConfigured = false;
            return;
        }
        try {
            this.transporter = nodemailer_1.default.createTransport({
                host,
                port,
                secure: port === 465,
                auth: {
                    user,
                    pass,
                },
                pool: true,
                maxConnections: 5,
                rateLimit: 10,
            });
            this.transporter.verify((error) => {
                if (error) {
                    logger_1.logger.error('Email transporter verification failed:', error);
                    this.isConfigured = false;
                }
                else {
                    logger_1.logger.info('Email service configured successfully');
                    this.isConfigured = true;
                }
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to initialize email service:', error);
            this.isConfigured = false;
        }
    }
    static getInstance() {
        if (!EmailService.instance) {
            EmailService.instance = new EmailService();
        }
        return EmailService.instance;
    }
    async sendEmail(options) {
        if (!this.isConfigured) {
            logger_1.logger.info('Email not sent (service not configured):', {
                to: options.to,
                subject: options.subject,
            });
            return;
        }
        try {
            if (!this.transporter) {
                logger_1.logger.warn('Email transporter is not configured. Skipping actual send.');
                return;
            }
            const from = process.env.SMTP_FROM || 'noreply@travelwave.ai';
            const recipients = Array.isArray(options.to) ? options.to.join(', ') : options.to;
            const mailOptions = {
                from: `TravelWave <${from}>`,
                to: recipients,
                subject: options.subject,
                html: options.html,
                text: options.text || options.html.replace(/<[^>]*>/g, ''),
                attachments: options.attachments,
            };
            const info = await this.transporter.sendMail(mailOptions);
            logger_1.logger.info('Email sent successfully:', {
                messageId: info.messageId,
                to: options.to,
                subject: options.subject,
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to send email:', error);
            throw new errors_1.AppError('Failed to send email', 500);
        }
    }
    async sendWelcomeEmail(user, verificationToken) {
        const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
        const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f1f5f9; padding: 40px; }
            .container { max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 16px; padding: 40px; border: 1px solid #334155; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 32px; font-weight: bold; background: linear-gradient(135deg, #60a5fa, #818cf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
            .content { line-height: 1.6; }
            .button { display: inline-block; padding: 12px 32px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #334155; font-size: 14px; color: #94a3b8; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🧭 TravelWave</div>
              <p style="color: #94a3b8; margin-top: 8px;">Your AI-Powered Travel Companion</p>
            </div>
            <div class="content">
              <h2 style="color: #f1f5f9;">Welcome ${user.firstName}! 🌟</h2>
              <p style="color: #cbd5e1;">Thank you for joining TravelWave. We're excited to help you plan your perfect journey!</p>
              <p style="color: #cbd5e1;">Please verify your email address to get started:</p>
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </div>
              <p style="color: #94a3b8; font-size: 14px;">Or copy and paste this link into your browser:</p>
              <p style="color: #64748b; font-size: 12px; word-break: break-all; background: #0f172a; padding: 12px; border-radius: 8px;">${verificationUrl}</p>
              <p style="color: #94a3b8; font-size: 14px;">This link will expire in 24 hours.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} TravelWave. All rights reserved.</p>
              <p>Built with ❤️ for Indian travelers</p>
            </div>
          </div>
        </body>
      </html>
    `;
        const text = `
      Welcome to TravelWave, ${user.firstName}!
      
      Thank you for joining TravelWave. Please verify your email address to get started:
      
      ${verificationUrl}
      
      This link will expire in 24 hours.
      
      Built with ❤️ for Indian travelers
    `;
        await this.sendEmail({
            to: user.email,
            subject: 'Welcome to TravelWave! ✨ Please verify your email',
            html,
            text,
        });
    }
    async sendPasswordResetEmail(user, resetToken) {
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f1f5f9; padding: 40px; }
            .container { max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 16px; padding: 40px; border: 1px solid #334155; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 32px; font-weight: bold; background: linear-gradient(135deg, #60a5fa, #818cf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
            .content { line-height: 1.6; }
            .button { display: inline-block; padding: 12px 32px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
            .warning { background: #7c3aed10; border-left: 4px solid #8b5cf6; padding: 16px; margin: 20px 0; border-radius: 4px; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #334155; font-size: 14px; color: #94a3b8; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🔐 TravelWave</div>
              <p style="color: #94a3b8; margin-top: 8px;">Password Reset Request</p>
            </div>
            <div class="content">
              <h2 style="color: #f1f5f9;">Reset Your Password</h2>
              <p style="color: #cbd5e1;">We received a request to reset your password for your TravelWave account.</p>
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              <p style="color: #94a3b8; font-size: 14px;">Or copy and paste this link into your browser:</p>
              <p style="color: #64748b; font-size: 12px; word-break: break-all; background: #0f172a; padding: 12px; border-radius: 8px;">${resetUrl}</p>
              <div class="warning">
                <p style="color: #fbbf24; margin: 0; font-size: 14px;">⚠️ This link will expire in 1 hour.</p>
                <p style="color: #94a3b8; margin: 8px 0 0 0; font-size: 14px;">If you didn't request this, please ignore this email.</p>
              </div>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} TravelWave. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
        const text = `
      Password Reset Request
      
      We received a request to reset your password for your TravelWave account.
      
      ${resetUrl}
      
      This link will expire in 1 hour.
      
      If you didn't request this, please ignore this email.
    `;
        await this.sendEmail({
            to: user.email,
            subject: '🔐 Reset Your TravelWave Password',
            html,
            text,
        });
    }
    async sendTripShareEmail(user, trip, shareUrl, recipientEmail) {
        const recipients = recipientEmail ? [recipientEmail] : [user.email];
        const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f1f5f9; padding: 40px; }
            .container { max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 16px; padding: 40px; border: 1px solid #334155; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 32px; font-weight: bold; background: linear-gradient(135deg, #60a5fa, #818cf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
            .trip-info { background: #0f172a; padding: 20px; border-radius: 12px; margin: 20px 0; }
            .button { display: inline-block; padding: 12px 32px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #334155; font-size: 14px; color: #94a3b8; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">📤 TravelWave</div>
              <p style="color: #94a3b8; margin-top: 8px;">Trip Shared with You</p>
            </div>
            <div class="content">
              <h2 style="color: #f1f5f9;">${user.firstName} wants to share a trip with you! 🗺️</h2>
              <div class="trip-info">
                <p style="color: #cbd5e1; margin: 4px 0;"><strong>📍 Destination:</strong> ${trip.destination}</p>
                <p style="color: #cbd5e1; margin: 4px 0;"><strong>📅 Duration:</strong> ${trip.durationDays} days</p>
                <p style="color: #cbd5e1; margin: 4px 0;"><strong>💰 Budget:</strong> ${trip.budgetTier}</p>
                ${trip.estimatedBudget?.total ? `<p style="color: #cbd5e1; margin: 4px 0;"><strong>💵 Est. Budget:</strong> ₹${trip.estimatedBudget.total.toLocaleString()}</p>` : ''}
              </div>
              <div style="text-align: center;">
                <a href="${shareUrl}" class="button">View Trip</a>
              </div>
              <p style="color: #94a3b8; font-size: 14px;">This trip was planned with AI-powered recommendations.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} TravelWave. All rights reserved.</p>
              <p>Plan your own trip at ${process.env.FRONTEND_URL}</p>
            </div>
          </div>
        </body>
      </html>
    `;
        await this.sendEmail({
            to: recipients,
            subject: `🗺️ ${user.firstName} shared a trip with you on TravelWave`,
            html,
        });
    }
    async sendTripExportEmail(user, trip, pdfBuffer, recipientEmail) {
        const recipients = recipientEmail ? [recipientEmail] : [user.email];
        const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f1f5f9; padding: 40px; }
            .container { max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 16px; padding: 40px; border: 1px solid #334155; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 32px; font-weight: bold; background: linear-gradient(135deg, #60a5fa, #818cf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #334155; font-size: 14px; color: #94a3b8; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">📄 TravelWave</div>
              <p style="color: #94a3b8; margin-top: 8px;">Trip Export Ready</p>
            </div>
            <div class="content">
              <h2 style="color: #f1f5f9;">Your Trip to ${trip.destination} is Ready! 📥</h2>
              <p style="color: #cbd5e1;">We've prepared a detailed PDF of your itinerary. Please find it attached to this email.</p>
              <p style="color: #cbd5e1;">The PDF includes:</p>
              <ul style="color: #cbd5e1;">
                <li>Day-by-day itinerary with activities</li>
                <li>Hotel recommendations</li>
                <li>Complete budget breakdown</li>
                <li>Packing checklist</li>
              </ul>
              <p style="color: #94a3b8; font-size: 14px;">Happy travels! 🧭</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} TravelWave. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
        await this.sendEmail({
            to: recipients,
            subject: `📄 Your ${trip.destination} Trip PDF from TravelWave`,
            html,
            attachments: [
                {
                    filename: `TravelWave-${trip.destination}-Itinerary.pdf`,
                    content: pdfBuffer,
                    contentType: 'application/pdf',
                },
            ],
        });
    }
    async sendPasswordResetConfirmation(user) {
        const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f1f5f9; padding: 40px; }
            .container { max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 16px; padding: 40px; border: 1px solid #334155; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 32px; font-weight: bold; background: linear-gradient(135deg, #60a5fa, #818cf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #334155; font-size: 14px; color: #94a3b8; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🔐 TravelWave</div>
              <p style="color: #94a3b8; margin-top: 8px;">Security Alert</p>
            </div>
            <div class="content">
              <h2 style="color: #f1f5f9;">Password Changed Successfully</h2>
              <p style="color: #cbd5e1;">Hello ${user.firstName},</p>
              <p style="color: #cbd5e1;">This is a confirmation that the password for your TravelWave account has been successfully changed.</p>
              <p style="color: #94a3b8; font-size: 14px;">If you did not make this change, please contact support immediately.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} TravelWave. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
        await this.sendEmail({
            to: user.email,
            subject: '🔐 TravelWave Password Changed Successfully',
            html,
        });
    }
}
exports.EmailService = EmailService;
//# sourceMappingURL=email.service.js.map