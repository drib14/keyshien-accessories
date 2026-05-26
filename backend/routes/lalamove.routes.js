import express from 'express';
import {
  getLalamoveQuotation,
  getLalamoveTracking,
} from '../controllers/lalamove.controller.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Fetch same-day express quotations
router.route('/quote').post(protect, getLalamoveQuotation);

// Get real-time delivery status & driver coordinates
router.route('/track/:orderId').get(protect, getLalamoveTracking);

export default router;
