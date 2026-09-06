import express from 'express';
import { createContact, getAllContacts, updateContactStatus } from '../controllers/contactController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route - anyone can submit contact form
router.post('/', createContact);

// Admin routes - protected
router.get('/admin/contacts', protect, admin, getAllContacts);
router.patch('/admin/contacts/:id/status', protect, admin, updateContactStatus);

export default router;
