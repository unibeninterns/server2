import express from 'express';
import adminController from '../controllers/admin.controller.js';
import { rateLimiter } from '../middleware/auth.middleware.js';

const router = express.Router();

// Apply rate limiting to all admin endpoints
const adminRateLimiter = rateLimiter(100, 60 * 60 * 1000); // 100 requests per hour

// Update proposal status
router.put(
  '/proposals/:id/status',
  adminRateLimiter,
  adminController.updateProposalStatus
);

// Assign reviewers to proposal
router.post(
  '/proposals/:id/reviewers',
  adminRateLimiter,
  adminController.assignReviewers
);

// Get proposal statistics
router.get(
  '/proposals/statistics',
  adminRateLimiter,
  adminController.getProposalStatistics
);

export default router;
