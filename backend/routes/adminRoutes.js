import express from 'express';
import {
    getAdminStats,
    getAllUsers,
    updateUserRole,
    deleteUser,
    getRevenueStats,
    getActivityLogs,
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats',    protect, admin, getAdminStats);
router.get('/revenue',  protect, admin, getRevenueStats);
router.get('/activity', protect, admin, getActivityLogs);
router.get('/users',    protect, admin, getAllUsers);
router.put('/users/:id/role',   protect, admin, updateUserRole);
router.delete('/users/:id',     protect, admin, deleteUser);

export default router;
