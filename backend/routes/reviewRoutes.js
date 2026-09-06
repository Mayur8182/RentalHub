import express from 'express';
import {
    createReview,
    getVehicleReviews,
    checkReviewed,
    deleteReview,
} from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public
router.get('/vehicle/:vehicleId', getVehicleReviews);

// Private
router.post('/', protect, createReview);
router.get('/check/:bookingId', protect, checkReviewed);
router.delete('/:id', protect, deleteReview);

export default router;
