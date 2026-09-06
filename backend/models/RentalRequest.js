import mongoose from 'mongoose';

const rentalRequestSchema = mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        vehicleId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vehicle',
            required: true,
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
        totalAmount: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ['Pending', 'Approved', 'Active', 'Completed', 'Rejected', 'Cancelled'],
            default: 'Pending',
        },
        pickupLocation: {
            type: String,
        },
        returnLocation: {
            type: String,
        },
        couponId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Coupon',
            default: null,
        },
        discountAmount: {
            type: Number,
            default: 0,
        },
        additionalNotes: {
            type: String,
        },
        // Extra services
        extras: {
            gps:             { type: Boolean, default: false },
            childSeat:       { type: Boolean, default: false },
            insurance:       { type: Boolean, default: false },
            additionalDriver: { type: Boolean, default: false },
        },
        extrasAmount: {
            type: Number,
            default: 0,
        },
        // Dynamic pricing
        weekendSurcharge: {
            type: Number,
            default: 0,
        },
        vehiclePickedUp: {
            type: Boolean,
            default: false,
        },
        vehicleReturned: {
            type: Boolean,
            default: false,
        },
        pickedUpAt: {
            type: Date,
            default: null,
        },
        returnedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

const RentalRequest = mongoose.model('RentalRequest', rentalRequestSchema);

export default RentalRequest;
