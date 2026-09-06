import Coupon from '../models/Coupon.js';
import logActivity from '../utils/logActivity.js';

// @desc    Create a coupon
// @route   POST /api/coupons
// @access  Private/Admin
export const createCoupon = async (req, res) => {
    try {
        const { code, description, discountType, discountValue, minOrderAmount, maxUses, expiresAt } = req.body;

        if (!code || !discountValue) {
            return res.status(400).json({ message: 'code and discountValue are required.' });
        }

        const exists = await Coupon.findOne({ code: code.toUpperCase() });
        if (exists) {
            return res.status(400).json({ message: `Coupon code "${code.toUpperCase()}" already exists.` });
        }

        const coupon = await Coupon.create({
            code: code.toUpperCase(),
            description,
            discountType: discountType || 'percentage',
            discountValue: Number(discountValue),
            minOrderAmount: Number(minOrderAmount) || 0,
            maxUses: maxUses ? Number(maxUses) : null,
            expiresAt: expiresAt || null,
        });

        logActivity({
            action: `Coupon "${coupon.code}" created (${coupon.discountValue}${coupon.discountType === 'percentage' ? '%' : '₹'} off)`,
            category: 'system',
            performedBy: req.user,
            targetId: coupon._id.toString(),
            ip: req.ip,
        });

        res.status(201).json(coupon);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private/Admin
export const getAllCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find({}).sort({ createdAt: -1 });
        res.json(coupons);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle coupon active status
// @route   PUT /api/coupons/:id/toggle
// @access  Private/Admin
export const toggleCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) return res.status(404).json({ message: 'Coupon not found.' });

        coupon.isActive = !coupon.isActive;
        await coupon.save();
        res.json(coupon);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
export const deleteCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findByIdAndDelete(req.params.id);
        if (!coupon) return res.status(404).json({ message: 'Coupon not found.' });

        logActivity({
            action: `Coupon "${coupon.code}" deleted`,
            category: 'system',
            performedBy: req.user,
            ip: req.ip,
        });

        res.json({ message: 'Coupon deleted.' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Validate a coupon code (user-facing)
// @route   POST /api/coupons/validate
// @access  Private
export const validateCoupon = async (req, res) => {
    try {
        const { code, orderAmount } = req.body;

        if (!code) return res.status(400).json({ message: 'Coupon code is required.' });

        const coupon = await Coupon.findOne({ code: code.toUpperCase() });

        if (!coupon)         return res.status(404).json({ message: 'Invalid coupon code.' });
        if (!coupon.isActive) return res.status(400).json({ message: 'This coupon is no longer active.' });

        if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
            return res.status(400).json({ message: 'This coupon has expired.' });
        }

        if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
            return res.status(400).json({ message: 'This coupon has reached its usage limit.' });
        }

        const amount = Number(orderAmount) || 0;
        if (coupon.minOrderAmount > 0 && amount < coupon.minOrderAmount) {
            return res.status(400).json({
                message: `Minimum order amount for this coupon is ₹${coupon.minOrderAmount.toLocaleString('en-IN')}.`,
            });
        }

        // Calculate discount
        let discountAmount = 0;
        if (coupon.discountType === 'percentage') {
            discountAmount = Math.round((amount * coupon.discountValue) / 100);
        } else {
            discountAmount = Math.min(coupon.discountValue, amount);
        }

        res.json({
            valid: true,
            coupon: {
                _id:           coupon._id,
                code:          coupon.code,
                description:   coupon.description,
                discountType:  coupon.discountType,
                discountValue: coupon.discountValue,
            },
            discountAmount,
            finalAmount: Math.max(0, amount - discountAmount),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Increment usedCount after successful booking (called internally)
export const incrementCouponUse = async (couponId) => {
    try {
        await Coupon.findByIdAndUpdate(couponId, { $inc: { usedCount: 1 } });
    } catch {
        // silent
    }
};
