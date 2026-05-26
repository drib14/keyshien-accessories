import express from 'express';
import {
  registerUser,
  loginUser,
  verifyEmail,
  forgotPassword,
  verifyResetCode,
  resetPassword,
  getUserProfile,
  updateUserProfile,
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/verify/:token', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-code', verifyResetCode);
router.post('/reset-password', resetPassword);

router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

export default router;
