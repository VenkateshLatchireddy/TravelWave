"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const export_controller_1 = require("../controllers/export.controller");
const auth_1 = require("../middleware/auth");
const rateLimiter_1 = require("../middleware/rateLimiter");
const router = (0, express_1.Router)();
const exportController = export_controller_1.ExportController.getInstance();
router.use(auth_1.authMiddleware);
router.get('/:id/pdf', (0, rateLimiter_1.rateLimiter)({ windowMs: 60 * 1000, max: 5 }), exportController.exportPDF);
router.post('/:id/email', (0, rateLimiter_1.rateLimiter)({ windowMs: 60 * 1000, max: 3 }), exportController.exportPDFAndEmail);
router.get('/:id/json', (0, rateLimiter_1.rateLimiter)({ windowMs: 60 * 1000, max: 5 }), exportController.exportJSON);
router.get('/shared/:token/pdf', exportController.generateShareablePDF);
exports.default = router;
//# sourceMappingURL=export.routes.js.map