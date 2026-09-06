import ActivityLog from '../models/ActivityLog.js';

/**
 * Utility to write an activity log entry.
 * Fails silently so logging never breaks main request flow.
 *
 * @param {object} opts
 * @param {string}  opts.action        - Human-readable description, e.g. "Booking #ABC approved"
 * @param {string}  opts.category      - 'booking' | 'user' | 'vehicle' | 'auth' | 'contact' | 'system'
 * @param {object}  [opts.performedBy] - User document (has _id, name)
 * @param {string}  [opts.targetId]    - ID of affected document
 * @param {string}  [opts.targetName]  - Human-readable name of affected entity
 * @param {object}  [opts.meta]        - Any extra key/value pairs
 * @param {string}  [opts.ip]          - Request IP
 */
const logActivity = async ({
    action,
    category = 'system',
    performedBy = null,
    targetId = null,
    targetName = null,
    meta = {},
    ip = null,
}) => {
    try {
        await ActivityLog.create({
            action,
            category,
            performedBy: performedBy?._id ?? null,
            performedByName: performedBy?.name ?? 'System',
            targetId,
            targetName,
            meta,
            ip,
        });
    } catch {
        // Logging should never crash the server
    }
};

export default logActivity;
