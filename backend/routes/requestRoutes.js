import express from 'express';
import { 
    createRequest, 
    getMyRequests, 
    getAllRequests, 
    updateRequestStatus,
    cancelRequest,
    getRequestById,
    updatePickupStatus,
} from '../controllers/requestController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// User routes
router.post('/', protect, createRequest);
router.get('/my', protect, getMyRequests);
router.get('/:id', protect, getRequestById);
router.put('/:id/cancel', protect, cancelRequest);

// Admin routes
router.get('/', protect, admin, getAllRequests);
router.put('/:id/status', protect, admin, updateRequestStatus);
router.put('/:id/pickup-status', protect, admin, updatePickupStatus);

export default router;
