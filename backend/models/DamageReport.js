import mongoose from 'mongoose';

const damageReportSchema = mongoose.Schema(
    {
        bookingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'RentalRequest',
            required: true,
        },
        vehicleId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vehicle',
            required: true,
        },
        reportType: {
            type: String,
            enum: ['pickup', 'return'],
            required: true,
        },
        conditions: {
            scratch:   { type: Boolean, default: false },
            dent:      { type: Boolean, default: false },
            fuelIssue: { type: Boolean, default: false },
            other:     { type: Boolean, default: false },
        },
        notes: {
            type: String,
            default: '',
        },
        reportedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    { timestamps: true }
);

const DamageReport = mongoose.model('DamageReport', damageReportSchema);
export default DamageReport;
