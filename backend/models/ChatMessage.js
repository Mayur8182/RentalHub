import mongoose from 'mongoose';

const chatMessageSchema = mongoose.Schema(
    {
        roomCode: {
            type: String,
            required: true,
            uppercase: true,
            trim: true,
            index: true,
        },
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        senderName: {
            type: String,
            required: true,
        },
        senderRole: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        },
        message: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000,
        },
    },
    { timestamps: true }
);

// Auto-delete messages older than 30 days
chatMessageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);
export default ChatMessage;
