"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../utils/auth");
const rateLimiter_1 = require("../middleware/rateLimiter");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
// Demo login endpoint for development
router.post('/demo-login', rateLimiter_1.authLimiter, (0, errorHandler_1.asyncHandler)(auth_1.demoLogin));
// Magic link login (placeholder for future implementation)
router.post('/magic-link', rateLimiter_1.authLimiter, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    // TODO: Implement magic link authentication with Supabase
    res.json({
        success: false,
        error: 'Magic link authentication not implemented yet. Use demo login instead.'
    });
}));
// Logout endpoint
router.post('/logout', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    // For stateless JWT tokens, logout is handled client-side
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
}));
exports.default = router;
//# sourceMappingURL=auth.js.map