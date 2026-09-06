import Offer from '../models/Offer.js';

// @desc    Get all active offers
// @route   GET /api/offers
// @access  Public
export const getOffers = async (req, res) => {
    try {
        const offers = await Offer.find({ status: 'Active' });
        res.json(offers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create an offer (Admin)
// @route   POST /api/offers
// @access  Private/Admin
export const createOffer = async (req, res) => {
    try {
        const { title, description, discount, image, validUntil } = req.body;
        const offer = await Offer.create({ title, description, discount, image, validUntil });
        res.status(201).json(offer);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete an offer (Admin)
// @route   DELETE /api/offers/:id
// @access  Private/Admin
export const deleteOffer = async (req, res) => {
    try {
        const offer = await Offer.findByIdAndDelete(req.params.id);
        if (offer) {
            res.json({ message: 'Offer removed' });
        } else {
            res.status(404).json({ message: 'Offer not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
