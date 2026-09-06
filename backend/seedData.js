import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Category from './models/Category.js';
import Vehicle from './models/Vehicle.js';
import connectDB from './config/db.js';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany();
    await Category.deleteMany();
    await Vehicle.deleteMany();

    console.log('Data cleared...');

    // Create Admin User (password will be hashed by User model pre-save hook)
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@rentalhub.com',
      password: 'admin123', // Will be hashed automatically
      phone: '+91 98765 43210',
      role: 'admin'
    });

    console.log('Admin user created - Email: admin@rentalhub.com, Password: admin123');

    // Create Regular User
    await User.create({
      name: 'Regular User',
      email: 'user@rentalhub.com',
      password: 'user123', // Will be hashed automatically
      phone: '+91 98765 43211',
      role: 'user'
    });

    console.log('Regular user created - Email: user@rentalhub.com, Password: user123');

    // Create Categories
    const sedanCategory = await Category.create({
      name: 'Sedan',
      description: 'Comfortable 4-door cars perfect for city driving'
    });

    const suvCategory = await Category.create({
      name: 'SUV',
      description: 'Spacious vehicles for family trips and adventures'
    });

    const luxuryCategory = await Category.create({
      name: 'Luxury',
      description: 'Premium vehicles for a comfortable experience'
    });

    const hatchbackCategory = await Category.create({
      name: 'Hatchback',
      description: 'Compact and fuel-efficient cars'
    });

    console.log('Categories created...');

    // Create Vehicles
    const vehicles = [
      {
        name: 'Honda City',
        category: sedanCategory._id,
        brand: 'Honda',
        image: 'https://imgd.aeplcdn.com/664x374/n/cw/ec/134287/city-exterior-right-front-three-quarter-77.jpeg?isig=0&q=80',
        description: 'Comfortable sedan with great fuel efficiency. Perfect for long drives and city commutes. Features a refined 1.5L petrol engine paired with a smooth CVT, offering excellent performance in both city traffic and highway cruising.',
        pricePerDay: 2500,
        availability: true,
        location: 'Mumbai',
        seats: 5,
        transmission: 'Automatic',
        fuel: 'Petrol',
        year: 2024,
        features: ['Air Conditioning', 'Bluetooth', 'USB Charging', 'Rear Camera', 'Cruise Control']
      },
      {
        name: 'Maruti Swift',
        category: hatchbackCategory._id,
        brand: 'Maruti Suzuki',
        image: 'https://imgd.aeplcdn.com/664x374/n/cw/ec/54399/swift-exterior-right-front-three-quarter-67.jpeg?isig=0&q=80',
        description: 'Popular hatchback known for reliability and low maintenance. The Swift delivers a punchy 1.2L engine, nimble handling, and excellent fuel economy — ideal for daily city driving.',
        pricePerDay: 1800,
        availability: true,
        location: 'Delhi',
        seats: 5,
        transmission: 'Manual',
        fuel: 'Petrol',
        year: 2023,
        features: ['Air Conditioning', 'Bluetooth', 'USB Charging', 'Power Windows', 'Central Locking']
      },
      {
        name: 'Hyundai Creta',
        category: suvCategory._id,
        brand: 'Hyundai',
        image: 'https://imgd.aeplcdn.com/664x374/n/cw/ec/106815/creta-exterior-right-front-three-quarter-4.jpeg?isig=0&q=80',
        description: 'Stylish SUV with spacious interiors and advanced features. The Creta offers a premium cabin, a large touchscreen infotainment system, and a choice of petrol and diesel engines for versatile performance.',
        pricePerDay: 3500,
        availability: true,
        location: 'Bangalore',
        seats: 5,
        transmission: 'Automatic',
        fuel: 'Petrol',
        year: 2024,
        features: ['Air Conditioning', 'Bluetooth', 'GPS', 'Sunroof', 'Rear Camera', 'USB Charging', 'Wireless Charging']
      },
      {
        name: 'Toyota Innova Crysta',
        category: suvCategory._id,
        brand: 'Toyota',
        image: 'https://imgd.aeplcdn.com/664x374/n/cw/ec/49051/innova-crysta-exterior-right-front-three-quarter-2.jpeg?isig=0&q=80',
        description: 'Premium MPV perfect for family trips with excellent comfort. Seats 7 passengers with ample luggage space, a powerful diesel engine, and captain seats in the second row for a true first-class road experience.',
        pricePerDay: 4000,
        availability: true,
        location: 'Pune',
        seats: 7,
        transmission: 'Automatic',
        fuel: 'Diesel',
        year: 2024,
        features: ['Air Conditioning', 'Bluetooth', 'GPS', 'USB Charging', 'Captain Seats', 'Rear AC Vents', 'Power Tailgate']
      },
      {
        name: 'BMW 3 Series',
        category: luxuryCategory._id,
        brand: 'BMW',
        image: 'https://imgd.aeplcdn.com/664x374/n/cw/ec/139133/3-series-exterior-right-front-three-quarter-6.jpeg?isig=0&q=80',
        description: 'Luxury sedan with powerful performance and premium features. The BMW 3 Series combines sporty dynamics with everyday comfort, featuring a turbocharged engine, adaptive suspension, and a state-of-the-art iDrive infotainment system.',
        pricePerDay: 8000,
        availability: true,
        location: 'Mumbai',
        seats: 5,
        transmission: 'Automatic',
        fuel: 'Petrol',
        year: 2025,
        features: ['Air Conditioning', 'Bluetooth', 'GPS', 'Sunroof', 'Leather Seats', 'Heated Seats', 'Parking Sensors', 'Lane Assist']
      },
      {
        name: 'Tata Nexon',
        category: suvCategory._id,
        brand: 'Tata',
        image: 'https://imgd.aeplcdn.com/664x374/n/cw/ec/141867/nexon-exterior-right-front-three-quarter-71.jpeg?isig=0&q=80',
        description: 'Compact SUV with great safety features and modern design. The Nexon is India\'s first 5-star NCAP-rated car, offering a bold exterior, feature-packed cabin, and a choice of petrol and diesel engines.',
        pricePerDay: 2800,
        availability: true,
        location: 'Chennai',
        seats: 5,
        transmission: 'Manual',
        fuel: 'Petrol',
        year: 2024,
        features: ['Air Conditioning', 'Bluetooth', 'GPS', 'Rear Camera', 'USB Charging', 'Sunroof']
      },
      {
        name: 'Kia Seltos',
        category: suvCategory._id,
        brand: 'Kia',
        image: 'https://imgd.aeplcdn.com/664x374/n/cw/ec/130591/seltos-exterior-right-front-three-quarter-67.jpeg?isig=0&q=80',
        description: 'Feature-rich SUV with connected car technology. The Seltos offers a segment-leading 10.25-inch touchscreen, Bose audio system, and advanced ADAS safety features for a premium experience.',
        pricePerDay: 3200,
        availability: true,
        location: 'Hyderabad',
        seats: 5,
        transmission: 'Automatic',
        fuel: 'Petrol',
        year: 2024,
        features: ['Air Conditioning', 'Bluetooth', 'GPS', 'Sunroof', 'Rear Camera', 'Wireless Charging', 'Bose Audio', 'ADAS']
      },
      {
        name: 'Mahindra XUV700',
        category: suvCategory._id,
        brand: 'Mahindra',
        image: 'https://imgd.aeplcdn.com/664x374/n/cw/ec/115777/xuv700-exterior-right-front-three-quarter-5.jpeg?isig=0&q=80',
        description: 'Premium SUV with advanced driver assistance systems. The XUV700 packs a 200hp diesel engine, a dual 10.25-inch display setup, and Level 2 ADAS — making it one of the most feature-loaded SUVs in India.',
        pricePerDay: 4500,
        availability: true,
        location: 'Mumbai',
        seats: 7,
        transmission: 'Automatic',
        fuel: 'Diesel',
        year: 2024,
        features: ['Air Conditioning', 'Bluetooth', 'GPS', 'Sunroof', 'ADAS', 'Wireless Charging', 'Rear Camera', '360 Camera', 'Ventilated Seats']
      },
      {
        name: 'Volkswagen Polo',
        category: hatchbackCategory._id,
        brand: 'Volkswagen',
        image: 'https://imgd.aeplcdn.com/664x374/n/cw/ec/27640/polo-exterior-right-front-three-quarter-45.jpeg?isig=0&q=80',
        description: 'German engineering in a compact package. The Polo is known for its solid build quality, precise steering, and peppy 1.0L TSI engine — a driver\'s car in the hatchback segment.',
        pricePerDay: 2200,
        availability: false,
        location: 'Bangalore',
        seats: 5,
        transmission: 'Manual',
        fuel: 'Petrol',
        year: 2023,
        features: ['Air Conditioning', 'Bluetooth', 'USB Charging', 'Power Windows', 'Rear Camera']
      },
      {
        name: 'Mercedes-Benz E-Class',
        category: luxuryCategory._id,
        brand: 'Mercedes-Benz',
        image: 'https://imgd.aeplcdn.com/664x374/n/cw/ec/159889/e-class-exterior-right-front-three-quarter.jpeg?isig=0&q=80',
        description: 'Ultimate luxury sedan with cutting-edge technology. The E-Class delivers a whisper-quiet cabin, massaging rear seats, a 12.8-inch OLED touchscreen, and a silky 2.0L turbo engine — the pinnacle of business-class motoring.',
        pricePerDay: 10000,
        availability: true,
        location: 'Delhi',
        seats: 5,
        transmission: 'Automatic',
        fuel: 'Petrol',
        year: 2025,
        features: ['Air Conditioning', 'Bluetooth', 'GPS', 'Leather Seats', 'Heated Seats', 'Massaging Seats', 'Sunroof', 'Parking Sensors', 'Burmester Audio', 'Ambient Lighting']
      }
    ];

    await Vehicle.insertMany(vehicles);

    console.log('Vehicles created...');
    console.log('\n=== SEED DATA COMPLETE ===');
    console.log('\nLogin Credentials:');
    console.log('Admin - Email: admin@rentalhub.com, Password: admin123');
    console.log('User - Email: user@rentalhub.com, Password: user123');
    console.log('\nTotal Vehicles:', vehicles.length);
    console.log('Total Categories:', 4);

    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
