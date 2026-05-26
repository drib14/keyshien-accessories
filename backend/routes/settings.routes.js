import express from 'express';
import { getSetting, updateSetting } from '../controllers/settings.controller.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router
  .route('/:key')
  .get(getSetting)
  .put(protect, admin, updateSetting);

export default router;
