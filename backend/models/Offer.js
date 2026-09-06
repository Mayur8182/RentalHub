import mongoose from 'mongoose';

const offerSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        discount: {
            type: Number, // Percentage or fixed amount
            required: true,
        },
        image: {
            type: String,
        },
        validUntil: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ['Active', 'Expired'],
            default: 'Active',
        },
    },
    {
        timestamps: true,
    }
);

const Offer = mongoose.model('Offer', offerSchema);

export default Offer;
