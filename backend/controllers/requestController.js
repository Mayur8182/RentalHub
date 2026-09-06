import RentalRequest from '../models/RentalRequest.js';
import logActivity from '../utils/logActivity.js';
import { incrementCouponUse } from './couponController.js';

// @desc    Create a rental request
// @route   POST /api/requests
// @access  Private
export const createRequest = async (req, res) => {
    try {
        const { vehicleId, startDate, endDate, totalAmount, pickupLocation, returnLocation, additionalNotes, couponId, discountAmount } = req.body;
        
        // Check for booking conflicts
        const conflictingBooking = await RentalRequest.findOne({
            vehicleId: vehicleId,
            status: { $in: ['Pending', 'Approved'] },
            $or: [
                { 
                    startDate: { $lte: new Date(endDate) }, 
                    endDate: { $gte: new Date(startDate) } 
                }
            ]
        });

        if (conflictingBooking) {
            return res.status(400).json({ 
                message: 'This vehicle is already booked for the selected dates. Please choose different dates.' 
            });
        }

        const request = await RentalRequest.create({
            userId: req.user._id,
            vehicleId,
            startDate,
            endDate,
            totalAmount,
            pickupLocation,
            returnLocation,
            additionalNotes,
            couponId:       couponId || null,
            discountAmount: discountAmount || 0,
        });
        
        res.status(201).json(request);

        // Increment coupon usage if one was applied
        if (couponId) incrementCouponUse(couponId);

        // Log after response
        logActivity({
            action: `Booking created for vehicle by ${req.user.name}`,
            category: 'booking',
            performedBy: req.user,
            targetId: request._id.toString(),
            meta: { vehicleId, totalAmount, startDate, endDate },
            ip: req.ip,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get logged in user's requests
// @route   GET /api/requests/my
// @access  Private
export const getMyRequests = async (req, res) => {
    try {
        const requests = await RentalRequest.find({ userId: req.user._id }).populate('vehicleId', 'name brand pricePerDay image');
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all requests (Admin)
// @route   GET /api/requests
// @access  Private/Admin
export const getAllRequests = async (req, res) => {
    try {
        const requests = await RentalRequest.find({})
            .populate('userId', 'name email')
            .populate('vehicleId', 'name brand');
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update request status (Admin)
// @route   PUT /api/requests/:id/status
// @access  Private/Admin
export const updateRequestStatus = async (req, res) => {
    try {
        const request = await RentalRequest.findById(req.params.id);
        if (request) {
            request.status = req.body.status || request.status;
            const updatedRequest = await request.save();
            res.json(updatedRequest);
            logActivity({
                action: `Booking #${request._id.toString().slice(-6).toUpperCase()} status → ${updatedRequest.status}`,
                category: 'booking',
                performedBy: req.user,
                targetId: request._id.toString(),
                meta: { newStatus: updatedRequest.status },
                ip: req.ip,
            });
        } else {
            res.status(404).json({ message: 'Request not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Cancel request (User)
// @route   PUT /api/requests/:id/cancel
// @access  Private
export const cancelRequest = async (req, res) => {
    try {
        const request = await RentalRequest.findById(req.params.id);
        
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        // Check if request belongs to user
        if (request.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to cancel this request' });
        }

        // Can only cancel pending requests
        if (request.status !== 'Pending') {
            return res.status(400).json({ message: 'Can only cancel pending requests' });
        }

        request.status = 'Cancelled';
        const updatedRequest = await request.save();
        res.json(updatedRequest);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get single request by ID (owner or admin)
// @route   GET /api/requests/:id
// @access  Private
export const getRequestById = async (req, res) => {
    try {
        const request = await RentalRequest.findById(req.params.id)
            .populate('vehicleId', 'name brand image pricePerDay location category seats transmission fuel year')
            .populate('userId', 'name email phone');

        if (!request) return res.status(404).json({ message: 'Booking not found' });

        // Only the owner or an admin can view
        if (request.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorised' });
        }

        res.json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update vehicle pickup/return status (Admin)
// @route   PUT /api/requests/:id/pickup-status
// @access  Private/Admin
export const updatePickupStatus = async (req, res) => {
    try {
        const { vehiclePickedUp, vehicleReturned } = req.body;
        const request = await RentalRequest.findById(req.params.id);
        if (!request) return res.status(404).json({ message: 'Booking not found' });

        if (vehiclePickedUp !== undefined) {
            request.vehiclePickedUp = vehiclePickedUp;
            request.pickedUpAt      = vehiclePickedUp ? new Date() : null;
        }
        if (vehicleReturned !== undefined) {
            request.vehicleReturned = vehicleReturned;
            request.returnedAt      = vehicleReturned ? new Date() : null;
        }

        const updated = await request.save();

        logActivity({
            action: vehicleReturned
                ? `Booking #${request._id.toString().slice(-6).toUpperCase()} — vehicle returned`
                : `Booking #${request._id.toString().slice(-6).toUpperCase()} — vehicle picked up`,
            category: 'booking',
            performedBy: req.user,
            targetId: request._id.toString(),
            ip: req.ip,
        });

        res.json(updated);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
