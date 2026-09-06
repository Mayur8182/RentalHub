import express from 'express';
import { getCategories, createCategory } from '../controllers/vehicleController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getCategories);

// Admin routes
router.post('/', protect, admin, createCategory);

export default router;
