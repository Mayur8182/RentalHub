import express from 'express';
import { createDamageReport, getDamageByBooking, getDamageByVehicle } from '../controllers/damageController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();
router.post('/',                          protect, admin, createDamageReport);
router.get('/booking/:bookingId',         protect, admin, getDamageByBooking);
router.get('/vehicle/:vehicleId',         protect, admin, getDamageByVehicle);
export default router;
