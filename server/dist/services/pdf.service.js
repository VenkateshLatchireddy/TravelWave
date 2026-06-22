"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PDFService = void 0;
const html_pdf_1 = __importDefault(require("html-pdf"));
const logger_1 = require("../utils/logger");
const errors_1 = require("../utils/errors");
class PDFService {
    static instance;
    constructor() { }
    static getInstance() {
        if (!PDFService.instance) {
            PDFService.instance = new PDFService();
        }
        return PDFService.instance;
    }
    async generateTripPDF(trip) {
        const formatCurrency = (amount) => {
            return new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0,
            }).format(amount);
        };
        const getWeatherEmoji = (timeOfDay) => {
            switch (timeOfDay) {
                case 'Morning': return '🌅';
                case 'Afternoon': return '☀️';
                case 'Evening': return '🌅';
                default: return '🌤️';
            }
        };
        const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Helvetica', 'Arial', sans-serif; background: white; color: #1e293b; padding: 40px; }
            .container { max-width: 900px; margin: 0 auto; }
            
            /* Header */
            .header { text-align: center; padding: 40px 0; border-bottom: 2px solid #e2e8f0; margin-bottom: 30px; }
            .logo { font-size: 36px; font-weight: bold; background: linear-gradient(135deg, #6366f1, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
            .subtitle { color: #64748b; font-size: 14px; margin-top: 4px; }
            
            /* Trip Info */
            .trip-info { background: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 30px; border: 1px solid #e2e8f0; }
            .trip-info h1 { font-size: 28px; margin-bottom: 8px; }
            .trip-info .meta { display: flex; gap: 24px; flex-wrap: wrap; margin-top: 12px; }
            .trip-info .meta span { color: #64748b; font-size: 14px; }
            .trip-info .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
            .badge-low { background: #dcfce7; color: #166534; }
            .badge-medium { background: #fef3c7; color: #92400e; }
            .badge-high { background: #f3e8ff; color: #5b21b6; }
            
            /* Section */
            .section { margin: 30px 0; }
            .section-title { font-size: 22px; font-weight: bold; color: #1e293b; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0; }
            
            /* Itinerary */
            .day-card { background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 16px; border: 1px solid #e2e8f0; }
            .day-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
            .day-header h3 { font-size: 18px; color: #1e293b; }
            .day-header .day-number { background: #6366f1; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; }
            
            .activity { padding: 12px; background: white; border-radius: 6px; margin-bottom: 8px; border: 1px solid #e2e8f0; }
            .activity .title { font-weight: 600; color: #1e293b; }
            .activity .description { color: #64748b; font-size: 14px; margin-top: 4px; }
            .activity .meta { display: flex; gap: 16px; margin-top: 8px; font-size: 12px; color: #94a3b8; flex-wrap: wrap; }
            .activity .cost { color: #6366f1; font-weight: 600; }
            
            /* Hotels */
            .hotel-card { background: #f8fafc; border-radius: 8px; padding: 16px; margin-bottom: 12px; border: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
            .hotel-card .name { font-weight: 600; }
            .hotel-card .details { color: #64748b; font-size: 14px; }
            .hotel-card .price { color: #6366f1; font-weight: 600; }
            
            /* Budget */
            .budget-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
            .budget-item { background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; }
            .budget-item .label { color: #64748b; font-size: 14px; }
            .budget-item .value { font-size: 20px; font-weight: bold; color: #1e293b; margin-top: 4px; }
            .budget-total { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 20px; border-radius: 12px; text-align: center; margin-top: 16px; }
            .budget-total .label { font-size: 16px; opacity: 0.9; }
            .budget-total .value { font-size: 32px; font-weight: bold; margin-top: 4px; }
            
            /* Packing */
            .packing-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
            .packing-item { display: flex; align-items: center; gap: 8px; padding: 8px; background: #f8fafc; border-radius: 4px; border: 1px solid #e2e8f0; }
            .packing-item .checkbox { width: 16px; height: 16px; border: 2px solid #cbd5e1; border-radius: 4px; flex-shrink: 0; }
            .packing-item .checked { background: #6366f1; border-color: #6366f1; position: relative; }
            .packing-item .checked::after { content: '✓'; color: white; font-size: 12px; display: flex; align-items: center; justify-content: center; }
            .packing-item .name { font-size: 14px; }
            .packing-item .packed { color: #94a3b8; text-decoration: line-through; }
            .packing-item .category { font-size: 11px; color: #94a3b8; margin-left: 4px; }
            
            /* Footer */
            .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 14px; }
            
            @media print {
              body { padding: 20px; }
              .day-card { break-inside: avoid; }
              .hotel-card { break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <!-- Header -->
            <div class="header">
              <div class="logo">🧭 TravelWave</div>
              <div class="subtitle">AI-Powered Travel Itinerary</div>
            </div>

            <!-- Trip Info -->
            <div class="trip-info">
              <h1>${trip.destination}</h1>
              <div class="meta">
                <span>📅 ${trip.durationDays} days</span>
                <span><span class="badge badge-${trip.budgetTier.toLowerCase()}">${trip.budgetTier} Budget</span></span>
                <span>💰 ${formatCurrency(trip.estimatedBudget.total)} total</span>
                <span>📊 ${trip.itinerary.length} days planned</span>
              </div>
              ${trip.interests?.length ? `<div style="margin-top: 12px; color: #64748b; font-size: 14px;">🎯 Interests: ${trip.interests.join(', ')}</div>` : ''}
            </div>

            <!-- Itinerary -->
            <div class="section">
              <h2 class="section-title">🗺️ Itinerary</h2>
              ${trip.itinerary.map((day) => `
                <div class="day-card">
                  <div class="day-header">
                    <h3>${day.title || `Day ${day.dayNumber}`}</h3>
                    <div class="day-number">${day.dayNumber}</div>
                  </div>
                  ${day.activities.map((activity) => `
                    <div class="activity">
                      <div class="title">${getWeatherEmoji(activity.timeOfDay)} ${activity.title}</div>
                      ${activity.description ? `<div class="description">${activity.description}</div>` : ''}
                      <div class="meta">
                        ${activity.timeOfDay ? `<span>⏰ ${activity.timeOfDay}</span>` : ''}
                        ${activity.location ? `<span>📍 ${activity.location}</span>` : ''}
                        ${activity.duration ? `<span>⏱️ ${activity.duration}</span>` : ''}
                        <span class="cost">${formatCurrency(activity.estimatedCostINR)}</span>
                      </div>
                    </div>
                  `).join('')}
                </div>
              `).join('')}
            </div>

            <!-- Hotels -->
            ${trip.hotels?.length ? `
              <div class="section">
                <h2 class="section-title">🏨 Recommended Hotels</h2>
                ${trip.hotels.map((hotel) => `
                  <div class="hotel-card">
                    <div>
                      <div class="name">${hotel.name}</div>
                      <div class="details">
                        ${hotel.location || ''} 
                        ${hotel.rating ? `• ⭐ ${hotel.rating}` : ''}
                        ${hotel.tier ? `• ${hotel.tier}` : ''}
                      </div>
                    </div>
                    <div class="price">${formatCurrency(hotel.estimatedCostNightINR)}/night</div>
                  </div>
                `).join('')}
              </div>
            ` : ''}

            <!-- Budget -->
            <div class="section">
              <h2 class="section-title">💰 Budget Breakdown</h2>
              <div class="budget-grid">
                ${[
            { label: 'Transport', value: trip.estimatedBudget.transport },
            { label: 'Accommodation', value: trip.estimatedBudget.accommodation },
            { label: 'Food', value: trip.estimatedBudget.food },
            { label: 'Activities', value: trip.estimatedBudget.activities },
            { label: 'Miscellaneous', value: trip.estimatedBudget.miscellaneous },
        ].map(item => `
                  <div class="budget-item">
                    <div class="label">${item.label}</div>
                    <div class="value">${formatCurrency(item.value)}</div>
                  </div>
                `).join('')}
              </div>
              <div class="budget-total">
                <div class="label">Total Estimated Budget</div>
                <div class="value">${formatCurrency(trip.estimatedBudget.total)}</div>
                <div style="font-size: 14px; opacity: 0.8; margin-top: 4px;">${trip.durationDays} days • ${formatCurrency(trip.estimatedBudget.total / trip.durationDays)} per day</div>
              </div>
            </div>

            <!-- Packing List -->
            ${trip.packingList?.length ? `
              <div class="section">
                <h2 class="section-title">🧳 Packing List</h2>
                <div class="packing-grid">
                  ${trip.packingList.map((item) => `
                    <div class="packing-item">
                      <div class="checkbox ${item.isPacked ? 'checked' : ''}"></div>
                      <div class="name ${item.isPacked ? 'packed' : ''}">${item.item} ${item.quantity > 1 ? `x${item.quantity}` : ''}</div>
                      <span class="category">${item.category}</span>
                    </div>
                  `).join('')}
                </div>
                <div style="margin-top: 12px; color: #64748b; font-size: 14px;">
                  ✅ ${trip.packingList.filter((i) => i.isPacked).length} / ${trip.packingList.length} packed
                </div>
              </div>
            ` : ''}

            <!-- Footer -->
            <div class="footer">
              <p>Generated by TravelWave • ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p>Plan your own trip at ${process.env.FRONTEND_URL}</p>
            </div>
          </div>
        </body>
      </html>
    `;
        return new Promise((resolve, reject) => {
            const options = {
                format: 'A4',
                orientation: 'portrait',
                border: {
                    top: '20px',
                    bottom: '20px',
                    left: '20px',
                    right: '20px',
                },
                quality: '75',
                paginationOffset: 0,
                header: {
                    height: '0px',
                },
                footer: {
                    height: '0px',
                },
                timeout: 60000,
            };
            html_pdf_1.default.create(html, options).toBuffer((err, buffer) => {
                if (err) {
                    logger_1.logger.error('PDF generation error:', err);
                    reject(new errors_1.AppError('Failed to generate PDF', 500));
                }
                else {
                    resolve(buffer);
                }
            });
        });
    }
}
exports.PDFService = PDFService;
//# sourceMappingURL=pdf.service.js.map