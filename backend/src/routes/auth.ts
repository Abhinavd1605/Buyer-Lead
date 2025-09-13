import { Router, Request, Response } from 'express';
import { demoLogin } from '../utils/auth';
import { authLimiter } from '../middleware/rateLimiter';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Demo login endpoint for development
router.post('/demo-login', authLimiter, asyncHandler(demoLogin));

// Magic link login (placeholder for future implementation)
router.post('/magic-link', authLimiter, asyncHandler(async (req: Request, res: Response) => {
  // TODO: Implement magic link authentication with Supabase
  res.json({
    success: false,
    error: 'Magic link authentication not implemented yet. Use demo login instead.'
  });
}));

// Logout endpoint
router.post('/logout', asyncHandler(async (req: Request, res: Response) => {
  // For stateless JWT tokens, logout is handled client-side
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
}));

export default router;
