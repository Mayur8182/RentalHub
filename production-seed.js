// Production seed data script
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './backend/models/User.js';
import Category from './backend/models/Category.js';
import Vehicle from './backend/models/Vehicle.js';

// Load production environment
dotenv.config({ path: './backend/.env.production' });

const seedProductionData = async () => {
  try {
    console.log('🔍 Connecting to production MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas');

    console.log('🔍 Checking existing data...');
    const existingUsers = await User.find({});
    const existingCategories = await Category.find({});
    const existingVehicles = await Vehicle.find({});

    console.log(`Found: ${existingUsers.length} users, ${existingCategories.length} categories, ${existingVehicles.length} vehicles`);

    // Only create admin user if no users exist
    if (existingUsers.length === 0) {
      console.log('📝 Creating admin user...');
      
      const adminUser = await User.create({
        name: 'Admin User',
        email: 'admin@rentalhub.com',
        password: 'admin123', // Will be hashed automatically
        phone: '+91 98765 43210',
        role: 'admin'
      });

      console.log('✅ Admin user created successfully');
      console.log('📧 Email: admin@rentalhub.com');
      console.log('🔑 Password: admin123');

      // Create a regular user too
      await User.create({
        name: 'Test User',
        email: 'user@rentalhub.com',
        password: 'user123',
        phone: '+91 98765 43211',
        role: 'user'
      });

      console.log('✅ Test user created: user@rentalhub.com / user123');
    } else {
      console.log('ℹ️  Users already exist, skipping user creation');
      existingUsers.forEach(user => {
        console.log(`  - ${user.name} (${user.email}) - Role: ${user.role}`);
      });
    }

    // Create categories if they don't exist
    if (existingCategories.length === 0) {
      console.log('📝 Creating vehicle categories...');
      
      const categories = await Category.create([
        { name: 'Sedan', description: 'Comfortable 4-door cars perfect for city driving' },
        { name: 'SUV', description: 'Spacious vehicles for family trips and adventures' },
        { name: 'Luxury', description: 'Premium vehicles for a comfortable experience' },
        { name: 'Hatchback', description: 'Compact and fuel-efficient cars' }
      ]);

      console.log(`✅ Created ${categories.length} categories`);
    } else {
      console.log('ℹ️  Categories already exist, skipping');
    }

    await mongoose.connection.close();
    console.log('🏁 Production seed completed successfully!');
    console.log('');
    console.log('🎯 Try logging in with:');
    console.log('   Email: admin@rentalhub.com');
    console.log('   Password: admin123');

  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seedProductionData();