import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import connectDB from './config/db.js';
import ChatMessage from './models/ChatMessage.js';
import User from './models/User.js';

dotenv.config();
connectDB();

const app = express();
const httpServer = createServer(app);

// ── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://rentcarhub.duckdns.org',
    'http://44.220.153.2',
    'http://localhost:5173',
    'http://localhost:3000',
];

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

// ── Socket.IO ─────────────────────────────────────────────────────────────────
const io = new Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

// Authenticate socket connections via JWT
io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth?.token;
        if (!token) return next(new Error('No token'));
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        const user = await User.findById(decoded.id).select('-password');
        if (!user) return next(new Error('User not found'));
        socket.user = user;
        next();
    } catch {
        next(new Error('Invalid token'));
    }
});

// Track active users per room: { roomCode: Set<socketId> }
const roomUsers = {};

io.on('connection', (socket) => {
    console.log(`[Chat] ${socket.user.name} connected (${socket.id})`);

    // ── Join a room ──────────────────────────────────────────────────────────
    socket.on('joinRoom', async ({ roomCode }) => {
        const code = roomCode?.toUpperCase()?.trim();
        if (!code) return;

        socket.join(code);
        socket.currentRoom = code;

        // Track users in room
        if (!roomUsers[code]) roomUsers[code] = new Set();
        roomUsers[code].add(socket.id);

        // Load last 50 messages from DB
        const history = await ChatMessage.find({ roomCode: code })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

        socket.emit('chatHistory', history.reverse());

        // Notify others
        socket.to(code).emit('userJoined', {
            name: socket.user.name,
            role: socket.user.role,
        });

        // Send room user count
        io.to(code).emit('roomUsers', roomUsers[code].size);

        console.log(`[Chat] ${socket.user.name} joined room ${code}`);
    });

    // ── Send a message ───────────────────────────────────────────────────────
    socket.on('sendMessage', async ({ roomCode, message }) => {
        const code = roomCode?.toUpperCase()?.trim();
        const text = message?.trim();
        if (!code || !text || text.length > 1000) return;

        const msg = await ChatMessage.create({
            roomCode:   code,
            senderId:   socket.user._id,
            senderName: socket.user.name,
            senderRole: socket.user.role,
            message:    text,
        });

        const payload = {
            _id:        msg._id,
            senderName: msg.senderName,
            senderRole: msg.senderRole,
            message:    msg.message,
            createdAt:  msg.createdAt,
        };

        io.to(code).emit('newMessage', payload);
    });

    // ── Typing indicator ─────────────────────────────────────────────────────
    socket.on('typing', ({ roomCode, isTyping }) => {
        socket.to(roomCode?.toUpperCase()).emit('userTyping', {
            name:     socket.user.name,
            isTyping,
        });
    });

    // ── Disconnect ────────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
        const code = socket.currentRoom;
        if (code && roomUsers[code]) {
            roomUsers[code].delete(socket.id);
            io.to(code).emit('roomUsers', roomUsers[code].size);
            if (roomUsers[code].size === 0) delete roomUsers[code];
        }
        console.log(`[Chat] ${socket.user?.name} disconnected`);
    });
});

// ── REST routes ───────────────────────────────────────────────────────────────
app.get('/', (req, res) => res.send('RentalHub API is running...'));

import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import damageRoutes from './routes/damageRoutes.js';
import maintenanceRoutes from './routes/maintenanceRoutes.js';

// Chat REST — get history for a room (authenticated)
import { protect } from './middleware/authMiddleware.js';
app.get('/api/chat/:roomCode/history', protect, async (req, res) => {
    try {
        const messages = await ChatMessage.find({
            roomCode: req.params.roomCode.toUpperCase(),
        }).sort({ createdAt: -1 }).limit(100).lean();
        res.json(messages.reverse());
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.use('/api/auth',        authRoutes);
app.use('/api/admin',       adminRoutes);
app.use('/api/requests',    requestRoutes);
app.use('/api/vehicles',    vehicleRoutes);
app.use('/api/categories',  categoryRoutes);
app.use('/api/contacts',    contactRoutes);
app.use('/api/reviews',     reviewRoutes);
app.use('/api/coupons',     couponRoutes);
app.use('/api/damage',      damageRoutes);
app.use('/api/maintenance', maintenanceRoutes);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(`Server + Socket.IO running on port ${PORT}`);
});
