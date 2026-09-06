import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async (retries = 5) => {
    try {
        const options = {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            maxPoolSize: 10,
            bufferCommands: false,
        };

        const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/rentalhub';

        const conn = await mongoose.connect(mongoUri, options);

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('⚠️ MongoDB disconnected');
        });

        const gracefulShutdown = async () => {
            try {
                await mongoose.connection.close();
                console.log('MongoDB connection closed through app termination');
                process.exit(0);
            } catch (error) {
                console.error('Error closing MongoDB connection:', error);
                process.exit(1);
            }
        };

        process.on('SIGINT', gracefulShutdown);
        process.on('SIGTERM', gracefulShutdown);

        return conn;
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);

        if (retries > 0) {
            console.log(`🔄 Retrying MongoDB connection... (${retries} attempts left)`);
            await new Promise((resolve) => setTimeout(resolve, 5000));
            return connectDB(retries - 1);
        }

        console.error('❌ All MongoDB connection attempts failed. Exiting...');
        process.exit(1);
    }
};

export default connectDB;
