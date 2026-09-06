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
    'http://rentcarhub.duckdns.org:3000',
    'http://44.220.153.2',
    'http://44.220.153.2:3000',
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

// ── Secret / Ephemeral Chat namespace (/secret) ───────────────────────────
// No login, no DB, max 2 per room, messages are relay-only (never stored).
// The room code itself is the shared secret — both users must know it.

const secretRooms = {};  // { roomCode: [ { socketId, name } ] }

const secret = io.of('/secret');

secret.on('connection', (socket) => {

    socket.on('joinSecret', ({ roomCode, name }) => {
        const code = roomCode?.toUpperCase()?.replace(/[^A-Z0-9]/g, '').slice(0, 12);
        const displayName = name?.trim().slice(0, 30);
        if (!code || !displayName) { socket.emit('error', 'Invalid code or name.'); return; }

        if (!secretRooms[code]) secretRooms[code] = [];

        // Max 2 users per room
        if (secretRooms[code].length >= 2) {
            socket.emit('roomFull', 'This room already has 2 people. Use a different code.');
            return;
        }

        // Reject if same socket already in room
        if (secretRooms[code].some(u => u.id === socket.id)) return;

        secretRooms[code].push({ id: socket.id, name: displayName });
        socket.join(code);
        socket.secretRoom = code;
        socket.secretName = displayName;

        socket.emit('joinedSecret', { code, name: displayName, count: secretRooms[code].length });

        // Notify the other person
        socket.to(code).emit('partnerJoined', { name: displayName });

        // Broadcast updated count
        secret.to(code).emit('roomCount', secretRooms[code].length);
    });

    // Relay encrypted message — server never decrypts, just forwards
    socket.on('secretMessage', ({ roomCode, encryptedText, msgId }) => {
        const code = roomCode?.toUpperCase();
        if (!code || !encryptedText) return;

        const payload = {
            msgId:         msgId || Date.now().toString(),
            encryptedText,
            senderName:    socket.secretName,
            senderId:      socket.id,
            ts:            Date.now(),
        };

        // Send to the OTHER person only (not back to sender)
        socket.to(code).emit('secretMessage', payload);
    });

    // Typing
    socket.on('secretTyping', ({ roomCode, isTyping }) => {
        socket.to(roomCode?.toUpperCase()).emit('partnerTyping', {
            name: socket.secretName, isTyping,
        });
    });

    // Disconnect
    socket.on('disconnect', () => {
        const code = socket.secretRoom;
        if (code && secretRooms[code]) {
            secretRooms[code] = secretRooms[code].filter(u => u.id !== socket.id);
            secret.to(code).emit('partnerLeft', { name: socket.secretName });
            secret.to(code).emit('roomCount', secretRooms[code].length);
            if (secretRooms[code].length === 0) delete secretRooms[code];
        }
    });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(`Server + Socket.IO running on port ${PORT}`);
});
