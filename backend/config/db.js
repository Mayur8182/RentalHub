import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async (retries = 5) => {
    try {
        // Connection options for better reliability
        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000, // 10 seconds timeout
            socketTimeoutMS: 45000, // Close sockets after 45 seconds
            maxPoolSize: 10, // Maintain up to 10 socket connections
            bufferMaxEntries: 0,
            bufferCommands: false,
        };

        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/rentalhub', options);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        
        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });

        // Graceful shutdown
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('MongoDB connection closed through app termination');
            process.exit(0);
        });

    } catch (error) {
        console.error(`❌ MongoDB connection failed: ${error.message}`);
        
        if (retries > 0) {
            console.log(`⏳ Retrying connection in 5 seconds... (${retries} attempts left)`);
            setTimeout(() => connectDB(retries - 1), 5000);
        } else {
            console.error('❌ All connection attempts failed. Exiting...');
            process.exit(1);
        }
    }
};

export default connectDB;
