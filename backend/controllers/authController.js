import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import logActivity from '../utils/logActivity.js';

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const authUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Find user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check password
        const isPasswordMatch = await user.matchPassword(password);

        if (!isPasswordMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate token and send response
        const token = generateToken(user._id);

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            createdAt: user.createdAt,
            token: token,
        });

        // Log activity (non-blocking)
        logActivity({ 
            action: `${user.name} logged in`, 
            category: 'auth', 
            performedBy: user, 
            ip: req.ip 
        }).catch(err => console.error('Activity log error:', err));

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
    const { name, email, password, phone } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
        name,
        email,
        password,
        phone,
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            createdAt: user.createdAt,
            token: generateToken(user._id),
        });
        logActivity({ action: `New user registered: ${user.name} (${user.email})`, category: 'auth', performedBy: user, ip: req.ip });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            createdAt: user.createdAt,
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Change password (logged-in user)
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Both currentPassword and newPassword are required.' });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters.' });
        }

        const user = await User.findById(req.user._id);
        const match = await user.matchPassword(currentPassword);
        if (!match) {
            return res.status(401).json({ message: 'Current password is incorrect.' });
        }

        user.password = newPassword; // pre-save hook hashes it
        await user.save();

        logActivity({ action: `${user.name} changed their password`, category: 'auth', performedBy: user, ip: req.ip });
        res.json({ message: 'Password changed successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Request password reset (generates token, returns reset URL in dev)
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        // Always respond with 200 to avoid email enumeration
        if (!user) {
            return res.json({ message: 'If that email exists, a reset link has been sent.' });
        }

        // Generate a random hex token
        const crypto = await import('crypto');
        const token = crypto.randomBytes(32).toString('hex');

        // Use findByIdAndUpdate to bypass the password pre-save hook
        await User.findByIdAndUpdate(user._id, {
            resetPasswordToken:   token,
            resetPasswordExpires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        });

        const resetUrl = `http://localhost:5173/reset-password/${token}`;

        // In production you would send an email here.
        // For dev we return the URL directly so it works without SMTP.
        res.json({
            message: 'Reset link generated. In production this would be emailed.',
            resetUrl, // remove this line in production
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reset password using token
// @route   PUT /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters.' });
        }

        const user = await User.findOne({
            resetPasswordToken:   token,
            resetPasswordExpires: { $gt: new Date() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Token is invalid or has expired.' });
        }

        user.password             = newPassword;
        user.resetPasswordToken   = null;
        user.resetPasswordExpires = null;
        await user.save();

        // Clear the token fields separately so the pre-save hook only sees password change
        await User.findByIdAndUpdate(user._id, {
            resetPasswordToken:   null,
            resetPasswordExpires: null,
        });

        logActivity({ action: `${user.name} reset their password via token`, category: 'auth', performedBy: user, ip: req.ip });
        res.json({ message: 'Password reset successfully. You can now log in.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
