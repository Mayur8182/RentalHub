import express from 'express';
import {
    createCoupon,
    getAllCoupons,
    toggleCoupon,
    deleteCoupon,
    validateCoupon,
} from '../controllers/couponController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// User route — validate a code before booking
router.post('/validate', protect, validateCoupon);

// Admin routes
router.get('/',          protect, admin, getAllCoupons);
router.post('/',         protect, admin, createCoupon);
router.put('/:id/toggle', protect, admin, toggleCoupon);
router.delete('/:id',    protect, admin, deleteCoupon);

export default router;
