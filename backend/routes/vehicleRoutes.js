import express from 'express';
import Vehicle from '../models/Vehicle.js';
import RentalRequest from '../models/RentalRequest.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import logActivity from '../utils/logActivity.js';
import { calculateDynamicPrice } from '../utils/pricingEngine.js';

const router = express.Router();

// @desc    Get all vehicles
// @route   GET /api/vehicles
// @access  Public
router.get('/', async (req, res) => {
    try {
        const vehicles = await Vehicle.find({}).populate('category');
        res.json(vehicles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Calculate dynamic price for a date range
// @route   POST /api/vehicles/pricing
// @access  Public
router.post('/pricing', async (req, res) => {
    try {
        const { vehicleId, startDate, endDate } = req.body;
        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

        const result = calculateDynamicPrice(
            startDate, endDate,
            vehicle.pricePerDay,
            vehicle.weekendMultiplier || 1.0,
            vehicle.holidayMultiplier || 1.0,
        );
        res.json(result);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

// @desc    Check vehicle availability for date range
// @route   POST /api/vehicles/check-availability
// @access  Public
router.post('/check-availability', async (req, res) => {
    try {
        const { vehicleId, startDate, endDate } = req.body;

        if (!vehicleId || !startDate || !endDate) {
            return res.status(400).json({ message: 'Please provide vehicleId, startDate, and endDate' });
        }

        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }

        if (!vehicle.availability) {
            return res.json({ available: false, message: 'Vehicle is currently unavailable' });
        }

        const conflictingBooking = await RentalRequest.findOne({
            vehicleId,
            status: { $in: ['Pending', 'Approved'] },
            $or: [{ startDate: { $lte: new Date(endDate) }, endDate: { $gte: new Date(startDate) } }]
        });

        if (conflictingBooking) {
            return res.json({
                available: false,
                message: 'Vehicle is already booked for these dates',
                conflictingBooking: { startDate: conflictingBooking.startDate, endDate: conflictingBooking.endDate }
            });
        }

        res.json({ available: true, message: 'Vehicle is available for these dates' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get vehicle by ID
// @route   GET /api/vehicles/:id
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id).populate('category');
        if (vehicle) {
            res.json(vehicle);
        } else {
            res.status(404).json({ message: 'Vehicle not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Create a vehicle
// @route   POST /api/vehicles
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
    try {
        const vehicle = await Vehicle.create(req.body);
        res.status(201).json(vehicle);
        logActivity({ action: `Vehicle "${vehicle.name}" created`, category: 'vehicle', performedBy: req.user, targetId: vehicle._id.toString(), targetName: vehicle.name, ip: req.ip });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @desc    Update a vehicle
// @route   PUT /api/vehicles/:id
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
    try {
        const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (vehicle) {
            res.json(vehicle);
        } else {
            res.status(404).json({ message: 'Vehicle not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @desc    Delete a vehicle
// @route   DELETE /api/vehicles/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
        if (vehicle) {
            res.json({ message: 'Vehicle removed' });
            logActivity({ action: `Vehicle "${vehicle.name}" deleted`, category: 'vehicle', performedBy: req.user, targetId: req.params.id, targetName: vehicle.name, ip: req.ip });
        } else {
            res.status(404).json({ message: 'Vehicle not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
