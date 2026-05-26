import express from 'express';
import {
  createCheckoutSession,
  verifyCheckoutSession,
  createWalletTopupSession,
  verifyWalletTopupSession,
} from '../controllers/payment.controller.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create-session', protect, createCheckoutSession);
router.get('/verify/:sessionId/:orderId', protect, verifyCheckoutSession);
router.post('/topup', protect, createWalletTopupSession);
router.get('/verify-topup/:sessionId/:amount', protect, verifyWalletTopupSession);

export default router;
