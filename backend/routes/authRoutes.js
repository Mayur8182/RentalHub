import express from 'express';
import {
    authUser,
    registerUser,
    getUserProfile,
    changePassword,
    forgotPassword,
    resetPassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register',               registerUser);
router.post('/login',                  authUser);
router.get('/profile',                 protect, getUserProfile);
router.put('/change-password',         protect, changePassword);
router.post('/forgot-password',        forgotPassword);
router.put('/reset-password/:token',   resetPassword);

export default router;
