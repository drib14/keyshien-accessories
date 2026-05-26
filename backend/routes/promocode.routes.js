import express from 'express';
import {
  getPromocodes,
  createPromocode,
  deletePromocode,
  validatePromocode,
} from '../controllers/promocode.controller.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Admin CRUD routes
router
  .route('/')
  .get(protect, admin, getPromocodes)
  .post(protect, admin, createPromocode);

router.route('/:id').delete(protect, admin, deletePromocode);

// Public validation route
router.route('/validate').post(protect, validatePromocode);

export default router;
