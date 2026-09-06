import MaintenanceLog from '../models/MaintenanceLog.js';
import Vehicle from '../models/Vehicle.js';
import logActivity from '../utils/logActivity.js';

// @desc  Create maintenance log entry
// @route POST /api/maintenance
export const createLog = async (req, res) => {
    try {
        const { vehicleId, type, description, cost, performedBy, scheduledDate, status } = req.body;
        const log = await MaintenanceLog.create({ vehicleId, type, description, cost, performedBy, scheduledDate, status, createdBy: req.user._id });
        logActivity({ action: `Maintenance log created for vehicle`, category: 'vehicle', performedBy: req.user, targetId: vehicleId, ip: req.ip });
        res.status(201).json(log);
    } catch (err) { res.status(400).json({ message: err.message }); }
};

// @desc  Get all logs for a vehicle
// @route GET /api/maintenance/vehicle/:vehicleId
export const getLogsByVehicle = async (req, res) => {
    try {
        const logs = await MaintenanceLog.find({ vehicleId: req.params.vehicleId })
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });
        res.json(logs);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// @desc  Update maintenance log status
// @route PUT /api/maintenance/:id
export const updateLog = async (req, res) => {
    try {
        const log = await MaintenanceLog.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!log) return res.status(404).json({ message: 'Log not found' });
        res.json(log);
    } catch (err) { res.status(400).json({ message: err.message }); }
};

// @desc  Update vehicle maintenance status
// @route PUT /api/maintenance/status/:vehicleId
export const updateMaintenanceStatus = async (req, res) => {
    try {
        const { maintenanceStatus } = req.body;
        const vehicle = await Vehicle.findByIdAndUpdate(
            req.params.vehicleId,
            { maintenanceStatus },
            { new: true }
        );
        if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
        logActivity({ action: `Vehicle "${vehicle.name}" status → ${maintenanceStatus}`, category: 'vehicle', performedBy: req.user, targetId: vehicle._id.toString(), targetName: vehicle.name, ip: req.ip });
        res.json(vehicle);
    } catch (err) { res.status(400).json({ message: err.message }); }
};

// @desc  Delete maintenance log
// @route DELETE /api/maintenance/:id
export const deleteLog = async (req, res) => {
    try {
        await MaintenanceLog.findByIdAndDelete(req.params.id);
        res.json({ message: 'Log deleted' });
    } catch (err) { res.status(400).json({ message: err.message }); }
};
