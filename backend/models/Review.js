import mongoose from 'mongoose';

const reviewSchema = mongoose.Schema(
    {
        vehicleId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vehicle',
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        bookingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'RentalRequest',
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000,
        },
    },
    {
        timestamps: true,
    }
);

// One review per booking — prevents duplicate reviews on the same booking
reviewSchema.index({ bookingId: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);

export default Review;
