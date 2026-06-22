// eslint-disable-next-line @typescript-eslint/no-require-imports
const htmlPdf = require('html-pdf') as {
  create: (
    html: string,
    options: Record<string, unknown>
  ) => { toBuffer: (cb: (err: Error | null, buffer: Buffer) => void) => void };
};

import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';
import { AppError } from '../utils/errors';

export class PDFService {
  private static instance: PDFService;
  private logoDataUri?: string;

  private constructor() { }

  public static getInstance(): PDFService {
    if (!PDFService.instance) {
      PDFService.instance = new PDFService();
    }
    return PDFService.instance;
  }

  public async generateTripPDF(trip: any): Promise<Buffer> {
    const logoDataUri = this.getLogoDataUri();

    const fmt = (n: number) =>
      new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(Number(n) || 0);

    const esc = (v: unknown) =>
      String(v ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

    const timeLabel = (t: string) => {
      switch (t?.toLowerCase()) {
        case 'morning': return 'Morning';
        case 'afternoon': return 'Afternoon';
        case 'evening': return 'Evening';
        default: return t || '';
      }
    };

    const timeColor = (t: string) => {
      switch (t?.toLowerCase()) {
        case 'morning': return '#D97706';
        case 'afternoon': return '#059669';
        case 'evening': return '#7C3AED';
        default: return '#6B7280';
      }
    };

    const tierColor = (tier: string) => {
      switch (tier?.toLowerCase()) {
        case 'budget': return '#059669';
        case 'mid-range': return '#D97706';
        case 'luxury': return '#7C3AED';
        default: return '#6B7280';
      }
    };

    const catIcon = (cat: string) => {
      const m: Record<string, string> = {
        documents: '📄', clothing: '👕', gear: '🎒',
        electronics: '📱', health: '💊', other: '📌',
      };
      return m[cat?.toLowerCase()] || '•';
    };

    const totalActivities: number = trip.itinerary.reduce(
      (a: number, d: any) => a + (d.activities?.length || 0), 0
    );
    const totalItems: number = trip.packingList?.length || 0;
    const packedItems: number = trip.packingList?.filter((i: any) => i.isPacked).length || 0;
    const packPct: number = totalItems > 0 ? Math.round((packedItems / totalItems) * 100) : 0;
    const perDay: number = trip.durationDays > 0
      ? trip.estimatedBudget.total / trip.durationDays
      : trip.estimatedBudget.total;
    const totalBudget = trip.estimatedBudget.total || 1;

    const budgetRows = [
      { label: 'Transportation', value: trip.estimatedBudget.transport },
      { label: 'Accommodation', value: trip.estimatedBudget.accommodation },
      { label: 'Food & Dining', value: trip.estimatedBudget.food },
      { label: 'Activities', value: trip.estimatedBudget.activities },
      { label: 'Miscellaneous', value: trip.estimatedBudget.miscellaneous },
    ];

    const date = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${esc(trip.destination)} — TravelWave</title>
  <style>
    *, *:before, *:after { margin:0; padding:0; box-sizing:border-box; }

    body {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 11pt;
      color: #1C1917;
      background: #FFFFFF;
      line-height: 1.65;
    }

    /* ─── HEADER ─────────────────────────────────────────── */
    .header {
      padding: 0;
      position: relative;
    }
    .header-stripe {
      height: 6px;
      background: #1C4532;
    }
    .header-body {
      padding: 44px 56px 36px;
      border-bottom: 1px solid #E7E5E4;
      position: relative;
    }
    .header-label {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 8pt;
      letter-spacing: 4px;
      text-transform: uppercase;
      color: #A8926A;
      margin-bottom: 14px;
    }
    .header-dest {
      font-size: 46pt;
      font-weight: bold;
      color: #1C1917;
      line-height: 0.95;
      letter-spacing: -1.5px;
      margin-bottom: 14px;
    }
    .header-dest em {
      color: #1C4532;
      font-style: normal;
    }
    .header-meta {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 9pt;
      color: #78716C;
      margin-bottom: 28px;
    }
    .header-pills {
      font-family: Arial, Helvetica, sans-serif;
    }
    .header-pill {
      display: inline-block;
      border: 1px solid #D6D3D1;
      padding: 4px 14px;
      border-radius: 2px;
      font-size: 8.5pt;
      color: #57534E;
      margin-right: 8px;
      margin-bottom: 4px;
    }
    .header-pill.accent {
      background: #1C4532;
      border-color: #1C4532;
      color: white;
    }
    .header-brand {
      position: absolute;
      top: 44px; right: 56px;
      text-align: right;
    }
    .header-brand img { width: 38px; height: 38px; object-fit: contain; margin-bottom: 4px; display: block; margin-left: auto; }
    .header-brand-name {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 11pt;
      font-weight: bold;
      color: #1C4532;
      letter-spacing: -0.3px;
    }
    .header-brand-name span { color: #A8926A; }

    /* ─── STATS BAND ─────────────────────────────────────── */
    .stats-band {
      background: #F7F3EE;
      border-bottom: 1px solid #E7E5E4;
      padding: 0 56px;
    }
    .stats-band table { width: 100%; border-collapse: collapse; }
    .stats-band td {
      padding: 18px 0;
      text-align: center;
      border-right: 1px solid #E7E5E4;
    }
    .stats-band td:first-child { text-align: left; }
    .stats-band td:last-child  { border-right: none; text-align: right; }
    .stat-number {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 22pt;
      font-weight: bold;
      color: #1C4532;
      line-height: 1;
      display: block;
    }
    .stat-label {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 7.5pt;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #A8A29E;
      display: block;
      margin-top: 3px;
    }

    /* ─── BODY ───────────────────────────────────────────── */
    .body { padding: 44px 56px; }

    /* ─── SECTION ────────────────────────────────────────── */
    .section { margin-bottom: 48px; }
    .section-head {
      margin-bottom: 24px;
      padding-bottom: 10px;
      border-bottom: 2px solid #1C1917;
    }
    .section-head-row { width: 100%; }
    .section-head-row td { vertical-align: baseline; }
    .section-title {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 8pt;
      letter-spacing: 4px;
      text-transform: uppercase;
      color: #1C4532;
      font-weight: bold;
    }
    .section-sub {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 8pt;
      color: #A8A29E;
      text-align: right;
    }

    /* ─── ITINERARY ──────────────────────────────────────── */
    .day-block { margin-bottom: 32px; page-break-inside: avoid; }
    .day-header-row { margin-bottom: 14px; }
    .day-num-box {
      display: inline-block;
      background: #1C1917;
      color: white;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 7.5pt;
      font-weight: bold;
      letter-spacing: 2px;
      text-transform: uppercase;
      padding: 3px 10px;
      margin-right: 12px;
      vertical-align: middle;
    }
    .day-title {
      font-size: 15pt;
      font-weight: bold;
      color: #1C1917;
      letter-spacing: -0.3px;
      vertical-align: middle;
    }

    .activity-item {
      padding: 12px 0 12px 20px;
      border-left: 2px solid #E7E5E4;
      margin-left: 6px;
      margin-bottom: 2px;
      position: relative;
      page-break-inside: avoid;
    }
    .activity-dot {
      position: absolute;
      left: -5px;
      top: 18px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #A8926A;
    }
    .activity-top { margin-bottom: 3px; }
    .activity-time-tag {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 7.5pt;
      font-weight: bold;
      letter-spacing: 1px;
      text-transform: uppercase;
      padding: 1px 7px;
      border-radius: 2px;
      color: white;
      margin-right: 8px;
      vertical-align: middle;
    }
    .activity-name {
      font-size: 11.5pt;
      font-weight: bold;
      color: #1C1917;
      vertical-align: middle;
    }
    .activity-cost {
      float: right;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 10pt;
      font-weight: bold;
      color: #1C4532;
    }
    .activity-desc {
      font-size: 9.5pt;
      color: #78716C;
      margin-top: 4px;
      line-height: 1.5;
    }
    .activity-info {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 8.5pt;
      color: #A8A29E;
      margin-top: 5px;
    }
    .activity-info span { margin-right: 14px; }

    /* ─── HOTELS ─────────────────────────────────────────── */
    .hotels-table { width: 100%; border-collapse: collapse; }
    .hotels-table tr { border-bottom: 1px solid #F5F5F4; }
    .hotels-table tr:last-child { border-bottom: none; }
    .hotels-table td { padding: 14px 8px; vertical-align: top; }
    .hotels-table td:first-child { padding-left: 0; width: 55%; }
    .hotels-table td:last-child  { padding-right: 0; text-align: right; }
    .hotel-name {
      font-size: 12pt;
      font-weight: bold;
      color: #1C1917;
      margin-bottom: 4px;
    }
    .hotel-tier-dot {
      display: inline-block;
      width: 8px; height: 8px;
      border-radius: 50%;
      margin-right: 5px;
      vertical-align: middle;
    }
    .hotel-tier-text {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 8pt;
      font-weight: bold;
      letter-spacing: 0.5px;
      vertical-align: middle;
    }
    .hotel-detail {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 8.5pt;
      color: #78716C;
      margin-top: 3px;
    }
    .hotel-amenities-line {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 8pt;
      color: #A8A29E;
      margin-top: 5px;
    }
    .hotel-price {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 16pt;
      font-weight: bold;
      color: #1C4532;
      line-height: 1;
    }
    .hotel-price-unit {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 8pt;
      color: #A8A29E;
      display: block;
      margin-top: 2px;
    }

    /* ─── BUDGET ─────────────────────────────────────────── */
    .budget-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .budget-table tr { border-bottom: 1px solid #F5F5F4; }
    .budget-table td { padding: 11px 0; vertical-align: middle; }
    .budget-label {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 9.5pt;
      color: #44403C;
      width: 36%;
    }
    .budget-bar-cell { width: 42%; padding: 11px 16px; }
    .budget-track {
      background: #F5F5F4;
      height: 5px;
      border-radius: 3px;
    }
    .budget-fill {
      height: 5px;
      border-radius: 3px;
      background: #A8926A;
    }
    .budget-value {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 9.5pt;
      font-weight: bold;
      color: #1C1917;
      text-align: right;
    }
    .budget-total-row {
      background: #1C4532;
    }
    .budget-total-row td {
      padding: 16px 20px;
      color: white;
      font-family: Arial, Helvetica, sans-serif;
      border-bottom: none !important;
    }
    .budget-total-label { font-size: 9pt; opacity: 0.75; display: block; margin-bottom: 2px; }
    .budget-total-amount { font-size: 20pt; font-weight: bold; line-height: 1; }
    .budget-perday { text-align: right; }
    .budget-perday-amount { font-size: 14pt; font-weight: bold; color: #A8E6C4; }
    .budget-perday-label { font-size: 8pt; opacity: 0.65; display: block; margin-top: 2px; }

    /* ─── PACKING ────────────────────────────────────────── */
    .packing-progress-row {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 8.5pt;
      color: #78716C;
      margin-bottom: 6px;
    }
    .packing-track { background: #F5F5F4; height: 4px; border-radius: 3px; margin-bottom: 20px; }
    .packing-fill  { height: 4px; border-radius: 3px; background: #1C4532; }

    .packing-cols-table { width: 100%; border-collapse: collapse; vertical-align: top; }
    .packing-cols-table td { width: 50%; vertical-align: top; padding-right: 24px; }
    .packing-cols-table td:last-child { padding-right: 0; }
    .packing-entry {
      padding: 8px 0;
      border-bottom: 1px solid #F5F5F4;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 9.5pt;
      color: #44403C;
    }
    .packing-entry.packed { color: #C4B8AE; text-decoration: line-through; }
    .packing-check-box {
      display: inline-block;
      width: 11px; height: 11px;
      border: 1.5px solid #C4B8AE;
      border-radius: 2px;
      margin-right: 8px;
      vertical-align: middle;
    }
    .packing-check-done {
      display: inline-block;
      width: 11px; height: 11px;
      background: #1C4532;
      border-radius: 2px;
      margin-right: 8px;
      vertical-align: middle;
      font-size: 7pt;
      color: white;
      text-align: center;
      line-height: 11px;
    }
    .packing-cat-icon { margin-right: 4px; }
    .packing-qty {
      float: right;
      font-size: 8pt;
      color: #A8A29E;
    }

    /* ─── FOOTER ─────────────────────────────────────────── */
    .footer {
      background: #1C1917;
      padding: 20px 56px;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 8pt;
      color: #78716C;
    }
    .footer-table { width: 100%; border-collapse: collapse; }
    .footer-table td { vertical-align: middle; }
    .footer-brand { color: #FFFFFF; font-weight: bold; font-size: 10pt; }
    .footer-brand span { color: #A8926A; }
    .footer-right { text-align: right; }

    /* ─── PRINT ──────────────────────────────────────────── */
    @media print {
      .header-stripe { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .stats-band { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .day-num-box { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .activity-time-tag { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .budget-total-row { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .budget-fill { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .packing-fill { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .packing-check-done { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .footer { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>

<!-- ═══ HEADER ═══════════════════════════════════════════ -->
<div class="header">
  <div class="header-stripe"></div>
  <div class="header-body">
    <div class="header-brand">
      ${logoDataUri ? `<img src="${logoDataUri}" alt="TravelWave">` : ''}
      <div class="header-brand-name">Travel<span>Wave</span></div>
    </div>
    <div class="header-label">Travel Itinerary &nbsp;&bull;&nbsp; AI-Generated</div>
    <div class="header-dest">${esc(trip.destination)}</div>
    <div class="header-meta">
      ${trip.durationDays}-day journey &nbsp;&bull;&nbsp; ${esc(trip.budgetTier)} budget
      &nbsp;&bull;&nbsp; ${totalActivities} curated experiences
    </div>
    <div class="header-pills">
      <span class="header-pill accent">${fmt(trip.estimatedBudget.total)} total</span>
      ${trip.interests?.slice(0, 4).map((i: string) => `<span class="header-pill">${esc(i)}</span>`).join('') || ''}
    </div>
  </div>
</div>

<!-- ═══ STATS BAND ════════════════════════════════════════ -->
<div class="stats-band">
  <table>
    <tr>
      <td>
        <span class="stat-number">${trip.durationDays}</span>
        <span class="stat-label">Days</span>
      </td>
      <td>
        <span class="stat-number">${totalActivities}</span>
        <span class="stat-label">Activities</span>
      </td>
      <td>
        <span class="stat-number">${trip.hotels?.length || 0}</span>
        <span class="stat-label">Hotels</span>
      </td>
      <td>
        <span class="stat-number">${totalItems}</span>
        <span class="stat-label">Pack Items</span>
      </td>
      <td>
        <span class="stat-number">${fmt(Math.round(perDay))}</span>
        <span class="stat-label">Per Day</span>
      </td>
    </tr>
  </table>
</div>

<!-- ═══ BODY ══════════════════════════════════════════════ -->
<div class="body">

  <!-- ── ITINERARY ──────────────────────────────────────── -->
  <div class="section">
    <div class="section-head">
      <table class="section-head-row"><tr>
        <td class="section-title">Itinerary</td>
        <td class="section-sub">${trip.itinerary.length} days planned</td>
      </tr></table>
    </div>

    ${trip.itinerary.map((day: any) => `
      <div class="day-block">
        <div class="day-header-row">
          <span class="day-num-box">Day ${day.dayNumber}</span>
          <span class="day-title">${esc(day.title || `Day ${day.dayNumber}`)}</span>
        </div>
        ${day.activities.map((act: any) => `
          <div class="activity-item">
            <div class="activity-dot"></div>
            <div class="activity-top">
              <span class="activity-cost">${fmt(act.estimatedCostINR)}</span>
              <span class="activity-time-tag" style="background:${timeColor(act.timeOfDay)}">${timeLabel(act.timeOfDay)}</span>
              <span class="activity-name">${esc(act.title)}</span>
            </div>
            ${act.description ? `<div class="activity-desc">${esc(act.description)}</div>` : ''}
            <div class="activity-info">
              ${act.location ? `<span>&#128205; ${esc(act.location)}</span>` : ''}
              ${act.duration ? `<span>&#9201; ${esc(act.duration)}</span>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    `).join('')}
  </div>

  <!-- ── HOTELS ─────────────────────────────────────────── -->
  ${trip.hotels?.length ? `
    <div class="section">
      <div class="section-head">
        <table class="section-head-row"><tr>
          <td class="section-title">Where to Stay</td>
          <td class="section-sub">${trip.hotels.length} recommendation${trip.hotels.length > 1 ? 's' : ''}</td>
        </tr></table>
      </div>
      <table class="hotels-table">
        ${trip.hotels.map((h: any) => `
          <tr>
            <td>
              <div class="hotel-name">${esc(h.name)}</div>
              <div>
                <span class="hotel-tier-dot" style="background:${tierColor(h.tier)}"></span>
                <span class="hotel-tier-text" style="color:${tierColor(h.tier)}">${esc(h.tier || 'Standard')}</span>
              </div>
              ${h.location ? `<div class="hotel-detail">&#128205; ${esc(h.location)}${h.rating ? ` &nbsp;&bull;&nbsp; &#11088; ${esc(h.rating)}` : ''}</div>` : ''}
              ${h.amenities?.length ? `<div class="hotel-amenities-line">${h.amenities.slice(0, 5).map((a: string) => esc(a)).join(' &nbsp;·&nbsp; ')}</div>` : ''}
            </td>
            <td>
              <div class="hotel-price">${fmt(h.estimatedCostNightINR)}</div>
              <span class="hotel-price-unit">per night</span>
            </td>
          </tr>
        `).join('')}
      </table>
    </div>
  ` : ''}

  <!-- ── BUDGET ─────────────────────────────────────────── -->
  <div class="section">
    <div class="section-head">
      <table class="section-head-row"><tr>
        <td class="section-title">Budget Breakdown</td>
        <td class="section-sub">All amounts in Indian Rupees</td>
      </tr></table>
    </div>
    <table class="budget-table">
      ${budgetRows.map(row => {
      const pct = Math.round(((Number(row.value) || 0) / totalBudget) * 100);
      return `
        <tr>
          <td class="budget-label">${esc(row.label)}</td>
          <td class="budget-bar-cell">
            <div class="budget-track">
              <div class="budget-fill" style="width:${pct}%"></div>
            </div>
          </td>
          <td class="budget-value">${fmt(row.value)}</td>
        </tr>`;
    }).join('')}
      <tr class="budget-total-row">
        <td colspan="2">
          <span class="budget-total-label">Total Estimated Budget</span>
          <span class="budget-total-amount">${fmt(trip.estimatedBudget.total)}</span>
        </td>
        <td class="budget-perday">
          <span class="budget-perday-amount">${fmt(Math.round(perDay))}</span>
          <span class="budget-perday-label">per day</span>
        </td>
      </tr>
    </table>
  </div>

  <!-- ── PACKING ────────────────────────────────────────── -->
  ${trip.packingList?.length ? `
    <div class="section">
      <div class="section-head">
        <table class="section-head-row"><tr>
          <td class="section-title">Packing List</td>
          <td class="section-sub">${packedItems} of ${totalItems} packed &nbsp;&bull;&nbsp; ${packPct}%</td>
        </tr></table>
      </div>
      <div class="packing-track">
        <div class="packing-fill" style="width:${packPct}%"></div>
      </div>
      <table class="packing-cols-table">
        <tr>
          ${(() => {
          const half = Math.ceil(trip.packingList.length / 2);
          const col1 = trip.packingList.slice(0, half);
          const col2 = trip.packingList.slice(half);
          const renderItem = (item: any) => `
              <div class="packing-entry${item.isPacked ? ' packed' : ''}">
                ${item.isPacked
              ? `<span class="packing-check-done">&#10003;</span>`
              : `<span class="packing-check-box"></span>`}
                <span class="packing-cat-icon">${catIcon(item.category)}</span>
                ${esc(item.item)}
                ${item.quantity > 1 ? `<span class="packing-qty">&#215;${item.quantity}</span>` : ''}
              </div>`;
          return `<td>${col1.map(renderItem).join('')}</td><td>${col2.map(renderItem).join('')}</td>`;
        })()}
        </tr>
      </table>
    </div>
  ` : ''}

</div><!-- /body -->

<!-- ═══ FOOTER ════════════════════════════════════════════ -->
<div class="footer">
  <table class="footer-table"><tr>
    <td>
      <span class="footer-brand">Travel<span>Wave</span></span>
      &nbsp;&nbsp;AI-Powered Travel Planner
    </td>
    <td class="footer-right">
      ${esc(trip.destination)} Itinerary &nbsp;&bull;&nbsp; Generated ${date}
    </td>
  </tr></table>
</div>

</body>
</html>`;

    return new Promise<Buffer>((resolve, reject) => {
      const options: Record<string, unknown> = {
        format: 'A4',
        orientation: 'portrait',
        border: { top: '0px', bottom: '0px', left: '0px', right: '0px' },
        header: { height: '0px' },
        footer: { height: '0px' },
        timeout: 90000,
        phantomArgs: [
          '--ignore-ssl-errors=yes',
          '--local-to-remote-url-access=yes',
          '--web-security=false',
        ],
      };

      htmlPdf.create(html, options).toBuffer((err: Error | null, buffer: Buffer) => {
        if (err) {
          logger.error('PDF generation error:', err);
          reject(new AppError('Failed to generate PDF', 500));
        } else {
          logger.info(`✅ PDF generated (${buffer.length} bytes)`);
          resolve(buffer);
        }
      });
    });
  }

  private getLogoDataUri(): string {
    if (this.logoDataUri !== undefined) return this.logoDataUri;

    const logoPaths = [
      path.resolve(process.cwd(), '..', 'client', 'src', 'assets', 'TravelWave.png'),
      path.resolve(process.cwd(), '..', 'client', 'src', 'assets', 'logo.png'),
      path.resolve(process.cwd(), '..', 'client', 'public', 'logo.png'),
    ];

    for (const logoPath of logoPaths) {
      try {
        if (fs.existsSync(logoPath)) {
          const logo = fs.readFileSync(logoPath);
          this.logoDataUri = `data:image/png;base64,${logo.toString('base64')}`;
          logger.info('✅ Logo found for PDF:', logoPath);
          return this.logoDataUri;
        }
      } catch {
        // continue
      }
    }

    logger.warn('⚠️  No logo found for PDF, using text-only brand');
    this.logoDataUri = '';
    return this.logoDataUri;
  }

  public async generateTripPDFBuffer(trip: any): Promise<Buffer> {
    return this.generateTripPDF(trip);
  }
}