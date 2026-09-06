// Quick login debug script for production
import mongoose from 'mongoose';
import User from './backend/models/User.js';
import dotenv from 'dotenv';

dotenv.config({ path: './backend/.env.production' });

const debugLogin = async () => {
    try {
        console.log('🔍 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB connected');

        console.log('🔍 Checking if users exist in database...');
        const users = await User.find({}).select('name email role');
        
        if (users.length === 0) {
            console.log('❌ No users found in database');
            console.log('💡 You need to run seed data first');
        } else {
            console.log('✅ Users found in database:');
            users.forEach(user => {
                console.log(`  - ${user.name} (${user.email}) - Role: ${user.role}`);
            });
        }

        console.log('🔍 Testing admin login credentials...');
        const adminUser = await User.findOne({ email: 'admin@rentalhub.com' });
        
        if (adminUser) {
            console.log('✅ Admin user exists');
            const isPasswordValid = await adminUser.matchPassword('admin123');
            if (isPasswordValid) {
                console.log('✅ Admin password is correct');
            } else {
                console.log('❌ Admin password is incorrect');
            }
        } else {
            console.log('❌ Admin user not found');
        }

        await mongoose.connection.close();
        console.log('🏁 Debug complete');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
};

debugLogin();