import mongoose from 'mongoose';

const activityLogSchema = mongoose.Schema(
    {
        action: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            enum: ['booking', 'user', 'vehicle', 'auth', 'contact', 'system'],
            default: 'system',
        },
        performedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        performedByName: {
            type: String,
            default: 'System',
        },
        targetId: {
            type: String,
            default: null,
        },
        targetName: {
            type: String,
            default: null,
        },
        meta: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
        ip: {
            type: String,
            default: null,
        },
    },
    { timestamps: true }
);

// TTL index — auto-delete logs older than 90 days
activityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
export default ActivityLog;
