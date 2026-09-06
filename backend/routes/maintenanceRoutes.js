import express from 'express';
import { createLog, getLogsByVehicle, updateLog, updateMaintenanceStatus, deleteLog } from '../controllers/maintenanceController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();
router.post('/',                         protect, admin, createLog);
router.get('/vehicle/:vehicleId',        protect, admin, getLogsByVehicle);
router.put('/status/:vehicleId',         protect, admin, updateMaintenanceStatus);
router.put('/:id',                       protect, admin, updateLog);
router.delete('/:id',                    protect, admin, deleteLog);
export default router;
