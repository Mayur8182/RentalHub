import Review from '../models/Review.js';
import RentalRequest from '../models/RentalRequest.js';

// @desc    Submit a review for a completed booking
// @route   POST /api/reviews
// @access  Private
export const createReview = async (req, res) => {
    try {
        const { bookingId, rating, comment } = req.body;

        if (!bookingId || !rating || !comment) {
            return res.status(400).json({ message: 'bookingId, rating and comment are required.' });
        }

        // Load the booking and verify it belongs to this user
        const booking = await RentalRequest.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found.' });
        }
        if (booking.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorised to review this booking.' });
        }
        if (booking.status !== 'Completed') {
            return res.status(400).json({ message: 'You can only review completed bookings.' });
        }

        // Check for duplicate
        const existing = await Review.findOne({ bookingId });
        if (existing) {
            return res.status(400).json({ message: 'You have already reviewed this booking.' });
        }

        const review = await Review.create({
            vehicleId: booking.vehicleId,
            userId: req.user._id,
            bookingId,
            rating: Number(rating),
            comment,
        });

        const populated = await review.populate('userId', 'name');
        res.status(201).json(populated);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all reviews for a vehicle (with aggregate stats)
// @route   GET /api/reviews/vehicle/:vehicleId
// @access  Public
export const getVehicleReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ vehicleId: req.params.vehicleId })
            .populate('userId', 'name')
            .sort({ createdAt: -1 });

        const count = reviews.length;
        const average =
            count > 0
                ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / count) * 10) / 10
                : 0;

        // Rating distribution (how many 1★ 2★ … 5★)
        const distribution = [1, 2, 3, 4, 5].reduce((acc, star) => {
            acc[star] = reviews.filter((r) => r.rating === star).length;
            return acc;
        }, {});

        res.json({ reviews, count, average, distribution });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Check whether the current user has reviewed a specific booking
// @route   GET /api/reviews/check/:bookingId
// @access  Private
export const checkReviewed = async (req, res) => {
    try {
        const review = await Review.findOne({ bookingId: req.params.bookingId });
        res.json({ reviewed: !!review, review: review || null });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete own review
// @route   DELETE /api/reviews/:id
// @access  Private
export const deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ message: 'Review not found.' });
        }
        if (review.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorised to delete this review.' });
        }
        await review.deleteOne();
        res.json({ message: 'Review deleted.' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
