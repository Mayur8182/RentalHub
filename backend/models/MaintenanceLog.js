import mongoose from 'mongoose';

const maintenanceLogSchema = mongoose.Schema(
    {
        vehicleId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vehicle',
            required: true,
        },
        type: {
            type: String,
            enum: ['scheduled', 'repair', 'inspection', 'cleaning', 'other'],
            default: 'scheduled',
        },
        description: {
            type: String,
            required: true,
        },
        cost: {
            type: Number,
            default: 0,
        },
        performedBy: {
            type: String,  // mechanic/workshop name
            default: '',
        },
        scheduledDate: { type: Date },
        completedDate: { type: Date, default: null },
        status: {
            type: String,
            enum: ['scheduled', 'in_progress', 'completed'],
            default: 'scheduled',
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    { timestamps: true }
);

const MaintenanceLog = mongoose.model('MaintenanceLog', maintenanceLogSchema);
export default MaintenanceLog;
