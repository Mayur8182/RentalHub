# RentalHub Testing Guide

## 🚀 Quick Start

Both servers are running:
- **Backend:** http://localhost:5000
- **Frontend:** http://localhost:5173

## 📝 Login Credentials

### Admin User
- **Email:** admin@rentalhub.com
- **Password:** admin123
- **Access:** Full admin dashboard + all user features

### Regular User
- **Email:** user@rentalhub.com
- **Password:** user123
- **Access:** Browse vehicles, book vehicles, view bookings

## ✅ Testing Steps

### 1. Test as Regular User

#### A. Login
1. Go to http://localhost:5173
2. Click **LOGIN** in navbar
3. Enter:
   - Email: `user@rentalhub.com`
   - Password: `user123`
4. Click **Sign In**
5. You should be redirected to home page
6. Your name should appear in navbar

#### B. Browse Vehicles
1. Click **FLEET** in navbar
2. You should see **10 vehicles** with:
   - Real images
   - Vehicle names (Honda City, Maruti Swift, etc.)
   - Prices in ₹
   - Availability status
   - "View Details" button

#### C. Book a Vehicle
1. Click **"View Details"** on any available vehicle
2. You'll see:
   - Vehicle image
   - Full details (name, brand, price, location)
   - **Booking form** on the right side
3. Fill the booking form:
   - **Start Date:** Select tomorrow's date
   - **End Date:** Select 3 days later
   - **Pickup Location:** Mumbai Airport
   - **Return Location:** Mumbai Airport
   - **Additional Notes:** (optional)
4. You'll see **Total Amount** calculated automatically
5. Click **"Submit Booking Request"**
6. You should see success message
7. You'll be redirected to **Profile** page

#### D. View Your Bookings
1. Go to **Profile** (your name in navbar)
2. You should see:
   - Your profile information
   - **"My Rental Bookings"** table
   - Your booking with status "Pending"
   - **Cancel** button (for pending bookings)

### 2. Test as Admin

#### A. Login as Admin
1. Click **LOGOUT**
2. Click **LOGIN**
3. Enter:
   - Email: `admin@rentalhub.com`
   - Password: `admin123`
4. Click **Sign In**
5. **ADMIN** link should appear in navbar

#### B. Access Admin Dashboard
1. Click **ADMIN** in navbar
2. You should see:
   - Statistics cards (Users: 2, Vehicles: 10, Bookings: X, Revenue)
   - Recent bookings table
   - **Approve** and **Reject** buttons

#### C. Manage Bookings
1. In dashboard, find the booking you created
2. Click **"Approve"**
3. Status should change to **"Approved"** (green)
4. The action buttons disappear

Alternative:
1. Click **"Bookings"** in left sidebar
2. See all bookings
3. Filter by status (All, Pending, Approved, etc.)
4. Test approve/reject/complete actions

#### D. Manage Vehicles
1. Click **"Vehicles"** in left sidebar
2. You should see all 10 vehicles in table
3. Click **"Add Vehicle"** button
4. Fill form:
   - Name: Test Car
   - Brand: Test Brand
   - Category: Select from dropdown
   - Price Per Day: 3000
   - Image URL: (any image URL)
   - Description: Test description
   - Location: Test Location
5. Check "Available for Rent"
6. Click **"Create Vehicle"**
7. New vehicle should appear in table
8. Test **Edit** and **Delete** buttons

#### E. Manage Users
1. Click **"Users"** in left sidebar
2. See all registered users (at least 2)
3. Find a regular user
4. Change their role from **"User"** to **"Admin"**
5. Role should update immediately

#### F. Manage Categories
1. Click **"Categories"** in left sidebar
2. See existing categories (Sedan, SUV, Luxury, Hatchback)
3. Click **"Add Category"**
4. Enter:
   - Name: Convertible
   - Description: Open-top luxury cars
5. Click **"Create Category"**
6. New category should appear in grid

## 🔄 Complete Booking Flow Test

### End-to-End Test:

1. **User books vehicle:**
   - Login as `user@rentalhub.com`
   - Browse fleet → View Details → Book vehicle
   - Check booking in Profile (Status: Pending)
   - Logout

2. **Admin approves:**
   - Login as `admin@rentalhub.com`
   - Go to Admin Dashboard
   - Find the pending booking
   - Click "Approve"
   - Logout

3. **User sees approved status:**
   - Login as `user@rentalhub.com`
   - Go to Profile
   - Booking status should be "Approved" (green)
   - Cancel button should be gone

4. **Admin marks completed:**
   - Login as `admin@rentalhub.com`
   - Go to Bookings
   - Filter by "Approved"
   - Click "Mark Complete"
   - Status changes to "Completed"

## 🎨 UI Features to Check

### Professional Design (No Emojis)
- ✅ All icons are professional (lucide-react)
- ✅ Clean black/white/grey color scheme
- ✅ Consistent button styling
- ✅ Status badges with colors:
  - Yellow: Pending
  - Green: Approved
  - Red: Rejected
  - Grey: Completed/Cancelled

### Responsive Elements
- All pages should work on different screen sizes
- Tables should be scrollable on small screens
- Forms should stack properly

## 🐛 Common Issues & Solutions

### Issue 1: "No vehicles found"
**Solution:** Run seed data again:
```bash
cd backend
node seedData.js
```

### Issue 2: "Cannot login"
**Solution:** Check if MongoDB is running and use correct credentials:
- Admin: admin@rentalhub.com / admin123
- User: user@rentalhub.com / user123

### Issue 3: "Admin link not showing"
**Solution:** Make sure you're logged in as admin user. Check user role in profile.

### Issue 4: "Booking form not appearing"
**Solution:** 
- Make sure you're logged in
- Check if vehicle is available
- Try a different vehicle

### Issue 5: "404 Error on routes"
**Solution:** Make sure both servers are running:
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## 📊 Data Available

### Users: 2
1. Admin (admin@rentalhub.com)
2. User (user@rentalhub.com)

### Categories: 4
1. Sedan
2. SUV
3. Luxury
4. Hatchback

### Vehicles: 10
1. Honda City - ₹2,500/day (Available)
2. Maruti Swift - ₹1,800/day (Available)
3. Hyundai Creta - ₹3,500/day (Available)
4. Toyota Innova Crysta - ₹4,000/day (Available)
5. BMW 3 Series - ₹8,000/day (Available)
6. Tata Nexon - ₹2,800/day (Available)
7. Kia Seltos - ₹3,200/day (Available)
8. Mahindra XUV700 - ₹4,500/day (Available)
9. Volkswagen Polo - ₹2,200/day (Unavailable)
10. Mercedes-Benz E-Class - ₹10,000/day (Available)

## ✨ All Features Working

- [x] User Registration & Login
- [x] Admin Login
- [x] Browse Vehicles (Fleet Page)
- [x] View Vehicle Details
- [x] Book Vehicle (with date validation & amount calculation)
- [x] View My Bookings
- [x] Cancel Pending Bookings
- [x] Admin Dashboard (Real Statistics)
- [x] Admin: Approve/Reject Bookings
- [x] Admin: Manage Vehicles (CRUD)
- [x] Admin: Manage Users (View, Change Roles)
- [x] Admin: Manage Categories
- [x] Role-Based Access Control
- [x] Professional UI (No Emojis)
- [x] Responsive Design

## 🎉 Ready for Testing!

Open http://localhost:5173 and start testing with the credentials above!
