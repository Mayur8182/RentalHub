// Enhanced login debug script for production
import mongoose from 'mongoose';
import User from './backend/models/User.js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config({ path: './backend/.env.production' });

const debugLogin = async () => {
    try {
        console.log('🔍 Enhanced login diagnostics...');
        console.log('MongoDB URI:', process.env.MONGO_URI ? 'Set' : 'Not Set');
        
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB connected');

        // Check if users exist
        console.log('\n🔍 Checking users in database...');
        const users = await User.find({}).select('name email role password');
        
        if (users.length === 0) {
            console.log('❌ No users found in database');
            console.log('💡 Creating admin user...');
            
            const adminUser = await User.create({
                name: 'Admin User',
                email: 'admin@rentalhub.com',
                password: 'admin123',
                phone: '+91 98765 43210',
                role: 'admin'
            });
            
            console.log('✅ Admin user created successfully');
        } else {
            console.log('✅ Users found:');
            for (const user of users) {
                console.log(`  - ${user.name} (${user.email}) - Role: ${user.role}`);
                
                // Test password comparison directly
                if (user.email === 'admin@rentalhub.com') {
                    console.log('  🔍 Testing password for admin user...');
                    try {
                        const isMatch = await user.matchPassword('admin123');
                        console.log(`  Password match: ${isMatch ? '✅ YES' : '❌ NO'}`);
                        
                        // Also test bcrypt directly
                        const directMatch = await bcrypt.compare('admin123', user.password);
                        console.log(`  Direct bcrypt: ${directMatch ? '✅ YES' : '❌ NO'}`);
                        
                        // Show password hash info
                        console.log(`  Password hash: ${user.password.substring(0, 20)}...`);
                    } catch (error) {
                        console.log(`  ❌ Error testing password: ${error.message}`);
                    }
                }
            }
        }

        // Test the login function directly
        console.log('\n🧪 Testing login simulation...');
        const testUser = await User.findOne({ email: 'admin@rentalhub.com' });
        if (testUser) {
            const loginTest = await testUser.matchPassword('admin123');
            console.log(`Login simulation: ${loginTest ? '✅ SUCCESS' : '❌ FAILED'}`);
        }

        await mongoose.connection.close();
        console.log('\n🏁 Debug complete');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Stack:', error.stack);
    }
};

debugLogin();