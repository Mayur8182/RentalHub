import User from '../models/User.js';
import Vehicle from '../models/Vehicle.js';
import RentalRequest from '../models/RentalRequest.js';
import Contact from '../models/Contact.js';
import Category from '../models/Category.js';
import ActivityLog from '../models/ActivityLog.js';
import logActivity from '../utils/logActivity.js';

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getAdminStats = async (req, res) => {
    try {
        // ── Basic counts ─────────────────────────────────────────────────
        const [
            totalUsers,
            totalVehicles,
            availableVehicles,
            totalBookings,
            pendingBookings,
            pendingContacts,
        ] = await Promise.all([
            User.countDocuments(),
            Vehicle.countDocuments(),
            Vehicle.countDocuments({ availability: true }),
            RentalRequest.countDocuments(),
            RentalRequest.countDocuments({ status: 'Pending' }),
            Contact.countDocuments({ status: 'pending' }),
        ]);

        // ── Total revenue (Approved + Completed bookings) ────────────────
        const revenueResult = await RentalRequest.aggregate([
            { $match: { status: { $in: ['Approved', 'Completed'] } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } },
        ]);
        const totalRevenue = revenueResult[0]?.total || 0;

        // ── Bookings per month (last 12 months) ──────────────────────────
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
        twelveMonthsAgo.setDate(1);
        twelveMonthsAgo.setHours(0, 0, 0, 0);

        const bookingsByMonthRaw = await RentalRequest.aggregate([
            { $match: { createdAt: { $gte: twelveMonthsAgo } } },
            {
                $group: {
                    _id: {
                        year:  { $year:  '$createdAt' },
                        month: { $month: '$createdAt' },
                    },
                    count:   { $sum: 1 },
                    revenue: { $sum: { $cond: [{ $in: ['$status', ['Approved', 'Completed']] }, '$totalAmount', 0] } },
                },
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]);

        // Build a full 12-slot array so months with 0 bookings still appear
        const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const bookingsByMonth = [];
        const revenueByMonth  = [];
        for (let i = 0; i < 12; i++) {
            const d     = new Date(twelveMonthsAgo);
            d.setMonth(d.getMonth() + i);
            const year  = d.getFullYear();
            const month = d.getMonth() + 1; // 1-based
            const found = bookingsByMonthRaw.find(
                (r) => r._id.year === year && r._id.month === month
            );
            bookingsByMonth.push({ label: monthNames[month - 1], count: found?.count   || 0 });
            revenueByMonth.push ({ label: monthNames[month - 1], amount: found?.revenue || 0 });
        }

        // ── Bookings by status ────────────────────────────────────────────
        const statusAgg = await RentalRequest.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } },
        ]);
        const bookingsByStatus = statusAgg.map((s) => ({ status: s._id, count: s.count }));

        // ── Vehicles by category ──────────────────────────────────────────
        const categoryAgg = await Vehicle.aggregate([
            {
                $lookup: {
                    from:         'categories',
                    localField:   'category',
                    foreignField: '_id',
                    as:           'cat',
                },
            },
            { $unwind: { path: '$cat', preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id:   '$cat.name',
                    count: { $sum: 1 },
                },
            },
            { $sort: { count: -1 } },
        ]);
        const vehiclesByCategory = categoryAgg.map((c) => ({
            category: c._id || 'Uncategorised',
            count:    c.count,
        }));

        res.json({
            // Scalar stats
            totalUsers,
            totalVehicles,
            availableVehicles,
            totalBookings,
            pendingBookings,
            totalRevenue,
            pendingContacts,
            // Chart data
            bookingsByMonth,
            revenueByMonth,
            bookingsByStatus,
            vehiclesByCategory,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
export const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        
        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent removing last admin
        if (user.role === 'admin' && role === 'user') {
            const adminCount = await User.countDocuments({ role: 'admin' });
            if (adminCount <= 1) {
                return res.status(400).json({ message: 'Cannot demote the last admin user' });
            }
        }

        user.role = role;
        await user.save();

        logActivity({
            action: `User ${user.name} role changed to ${role}`,
            category: 'user',
            performedBy: req.user,
            targetId: user._id.toString(),
            targetName: user.name,
            ip: req.ip,
        });

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get revenue breakdown for the Revenue Management page
// @route   GET /api/admin/revenue
// @access  Private/Admin
export const getRevenueStats = async (req, res) => {
    try {
        // All bookings with full population for the table
        const allBookings = await RentalRequest.find({})
            .populate('userId',   'name email')
            .populate('vehicleId', 'name brand')
            .sort({ createdAt: -1 });

        // Revenue buckets
        const completedStatuses = ['Approved', 'Completed', 'Active'];
        const pendingStatuses   = ['Pending'];

        let totalRevenue    = 0;
        let completedRevenue = 0;
        let pendingRevenue   = 0;

        allBookings.forEach((b) => {
            if (completedStatuses.includes(b.status)) {
                totalRevenue     += b.totalAmount;
                completedRevenue += b.totalAmount;
            } else if (pendingStatuses.includes(b.status)) {
                totalRevenue   += b.totalAmount;   // counted in total
                pendingRevenue += b.totalAmount;
            }
        });

        // Enrich each booking with calculated days
        const bookings = allBookings.map((b) => {
            const days = Math.max(
                1,
                Math.ceil(
                    (new Date(b.endDate) - new Date(b.startDate)) / (1000 * 60 * 60 * 24)
                )
            );
            return {
                _id:         b._id,
                userId:      b.userId,
                vehicleId:   b.vehicleId,
                startDate:   b.startDate,
                endDate:     b.endDate,
                totalAmount: b.totalAmount,
                status:      b.status,
                days,
                createdAt:   b.createdAt,
            };
        });

        res.json({
            totalRevenue,
            completedRevenue,
            pendingRevenue,
            bookings,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a user (Admin)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.role === 'admin') {
            const adminCount = await User.countDocuments({ role: 'admin' });
            if (adminCount <= 1) {
                return res.status(400).json({ message: 'Cannot delete the last admin user' });
            }
        }

        await user.deleteOne();
        logActivity({
            action: `User ${user.name} (${user.email}) deleted`,
            category: 'user',
            performedBy: req.user,
            targetId: user._id.toString(),
            targetName: user.name,
            ip: req.ip,
        });
        res.json({ message: 'User deleted' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get activity logs
// @route   GET /api/admin/activity
// @access  Private/Admin
export const getActivityLogs = async (req, res) => {
    try {
        const { category, limit = 100, page = 1 } = req.query;
        const filter = category && category !== 'all' ? { category } : {};
        const skip   = (Number(page) - 1) * Number(limit);

        const [logs, total] = await Promise.all([
            ActivityLog.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .populate('performedBy', 'name email'),
            ActivityLog.countDocuments(filter),
        ]);

        res.json({ logs, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
