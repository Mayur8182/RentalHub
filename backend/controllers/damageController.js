import DamageReport from '../models/DamageReport.js';
import logActivity from '../utils/logActivity.js';

// @desc  Create a damage report (admin)
// @route POST /api/damage
export const createDamageReport = async (req, res) => {
    try {
        const { bookingId, vehicleId, reportType, conditions, notes } = req.body;
        const report = await DamageReport.create({
            bookingId, vehicleId, reportType,
            conditions: conditions || {},
            notes: notes || '',
            reportedBy: req.user._id,
        });
        logActivity({ action: `Damage report (${reportType}) filed for vehicle`, category: 'vehicle', performedBy: req.user, targetId: vehicleId, ip: req.ip });
        res.status(201).json(report);
    } catch (err) { res.status(400).json({ message: err.message }); }
};

// @desc  Get all damage reports for a booking
// @route GET /api/damage/booking/:bookingId
export const getDamageByBooking = async (req, res) => {
    try {
        const reports = await DamageReport.find({ bookingId: req.params.bookingId }).sort({ createdAt: -1 });
        res.json(reports);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// @desc  Get all damage reports for a vehicle
// @route GET /api/damage/vehicle/:vehicleId
export const getDamageByVehicle = async (req, res) => {
    try {
        const reports = await DamageReport.find({ vehicleId: req.params.vehicleId })
            .populate('bookingId', 'startDate endDate')
            .sort({ createdAt: -1 });
        res.json(reports);
    } catch (err) { res.status(500).json({ message: err.message }); }
};
