import express from 'express';
import {
  createCheckoutSession,
  verifyCheckoutSession,
} from '../controllers/payment.controller.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create-session', protect, createCheckoutSession);
router.get('/verify/:sessionId/:orderId', protect, verifyCheckoutSession);

export default router;
