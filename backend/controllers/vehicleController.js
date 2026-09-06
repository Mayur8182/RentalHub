import Vehicle from '../models/Vehicle.js';
import Category from '../models/Category.js';
import logActivity from '../utils/logActivity.js';

// @desc    Get all vehicles
// @route   GET /api/vehicles
// @access  Public
export const getVehicles = async (req, res) => {
    try {
        const vehicles = await Vehicle.find({}).populate('category', 'name');
        res.json(vehicles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single vehicle
// @route   GET /api/vehicles/:id
// @access  Public
export const getVehicleById = async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id).populate('category', 'name');
        if (vehicle) {
            res.json(vehicle);
        } else {
            res.status(404).json({ message: 'Vehicle not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a vehicle
// @route   POST /api/vehicles
// @access  Private/Admin
export const createVehicle = async (req, res) => {
    try {
        const { name, category, brand, image, description, pricePerDay, availability, location,
                seats, transmission, fuel, year, features } = req.body;
        const vehicle = await Vehicle.create({
            name, category, brand, image, description, pricePerDay, availability, location,
            seats, transmission, fuel, year, features
        });
        res.status(201).json(vehicle);
        logActivity({ action: `Vehicle "${name}" created`, category: 'vehicle', performedBy: req.user, targetId: vehicle._id.toString(), targetName: name, ip: req.ip });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a vehicle
// @route   PUT /api/vehicles/:id
// @access  Private/Admin
export const updateVehicle = async (req, res) => {
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
};

// @desc    Delete a vehicle
// @route   DELETE /api/vehicles/:id
// @access  Private/Admin
export const deleteVehicle = async (req, res) => {
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
};

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res) => {
    try {
        const categories = await Category.find({});
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const category = await Category.create({ name, description });
        res.status(201).json(category);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
