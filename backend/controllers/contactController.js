import Contact from '../models/Contact.js';

// @desc    Create new contact query (public)
// @route   POST /api/contacts
// @access  Public
export const createContact = async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;

        // Validate input
        if (!name || !email || !message) {
            return res.status(400).json({ message: 'Please provide name, email, and message' });
        }

        // Validate message length
        if (message.length < 10 || message.length > 1000) {
            return res.status(400).json({ message: 'Message must be between 10 and 1000 characters' });
        }

        // Create contact
        const contact = await Contact.create({
            name,
            email,
            phone,
            message,
        });

        res.status(201).json({
            success: true,
            message: 'Your message has been sent successfully! We will get back to you soon.',
            contactId: contact._id,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all contacts with optional status filter (admin)
// @route   GET /api/admin/contacts?status=pending|resolved|all
// @access  Private/Admin
export const getAllContacts = async (req, res) => {
    try {
        const { status } = req.query;
        let query = {};

        // Apply status filter if provided
        if (status && status !== 'all') {
            if (!['pending', 'resolved'].includes(status)) {
                return res.status(400).json({ message: 'Invalid status value' });
            }
            query.status = status;
        }

        // Fetch contacts sorted by newest first
        const contacts = await Contact.find(query).sort({ createdAt: -1 });

        res.json({
            success: true,
            contacts,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update contact status (admin)
// @route   PATCH /api/admin/contacts/:id/status
// @access  Private/Admin
export const updateContactStatus = async (req, res) => {
    try {
        const { status } = req.body;

        // Validate status
        if (!status || !['pending', 'resolved'].includes(status)) {
            return res.status(400).json({ message: 'Status must be either "pending" or "resolved"' });
        }

        // Find and update contact
        const contact = await Contact.findById(req.params.id);

        if (!contact) {
            return res.status(404).json({ message: 'Contact not found' });
        }

        contact.status = status;
        await contact.save();

        res.json({
            success: true,
            message: `Contact marked as ${status}`,
            contact,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
