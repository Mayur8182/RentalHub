import mongoose from 'mongoose';

const vehicleSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: true,
        },
        brand: {
            type: String,
            required: true,
        },
        image: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        pricePerDay: {
            type: Number,
            required: true,
        },
        availability: {
            type: Boolean,
            default: true,
        },
        location: {
            type: String,
        },
        seats: {
            type: Number,
            default: 5,
        },
        transmission: {
            type: String,
            enum: ['Automatic', 'Manual'],
            default: 'Manual',
        },
        fuel: {
            type: String,
            enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG'],
            default: 'Petrol',
        },
        year: {
            type: Number,
        },
        features: {
            type: [String],
            default: [],
        },
        weekendMultiplier: {
            type: Number,
            default: 1.0,   // e.g. 1.25 = 25% more on weekends
            min: 1.0,
            max: 3.0,
        },
        holidayMultiplier: {
            type: Number,
            default: 1.0,
            min: 1.0,
            max: 3.0,
        },
        // Maintenance
        maintenanceStatus: {
            type: String,
            enum: ['available', 'booked', 'maintenance', 'out_of_service'],
            default: 'available',
        },
    },
    {
        timestamps: true,
    }
);

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

export default Vehicle;
