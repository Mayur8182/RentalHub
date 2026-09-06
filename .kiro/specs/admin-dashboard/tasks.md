# Implementation Plan - Admin Dashboard & Booking System

- [x] 1. Install professional icon library


  - Install lucide-react package for professional icons
  - Remove all emoji usage from existing components
  - _Requirements: 1.5, 8.5_



- [ ] 2. Add admin middleware to backend
  - Update `backend/middleware/authMiddleware.js` to export admin middleware function
  - Middleware should check if req.user.role === 'admin'


  - Return 403 Forbidden if user is not admin
  - _Requirements: 9.1, 9.2_

- [ ] 3. Create admin stats endpoint
  - Create `backend/controllers/adminController.js` with getAdminStats function
  - Calculate total users from User collection
  - Calculate total vehicles from Vehicle collection
  - Calculate total bookings from RentalRequest collection
  - Calculate total revenue from approved RentalRequest records

  - Create `backend/routes/adminRoutes.js` with GET /api/admin/stats route
  - Apply protect and admin middleware to the route
  - Add admin routes to server.js
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 4. Create user management endpoints
  - Add getAllUsers function to adminController that returns all users without passwords


  - Add updateUserRole function to adminController that updates user role
  - Add validation to prevent removing last admin user
  - Add GET /api/admin/users route with protect and admin middleware
  - Add PUT /api/admin/users/:id/role route with protect and admin middleware
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 9.4_

- [ ] 5. Create booking request routes with middleware protection
  - Create `backend/routes/requestRoutes.js` for rental request endpoints


  - Add POST /api/requests route (protect middleware) for creating requests
  - Add GET /api/requests/my route (protect middleware) for user's own requests
  - Add GET /api/requests route (protect + admin middleware) for all requests
  - Add PUT /api/requests/:id/status route (protect + admin middleware) for status updates
  - Add PUT /api/requests/:id/cancel route (protect middleware) for user cancellation
  - Add request routes to server.js
  - _Requirements: 2.1, 2.3, 2.4, 2.5, 6.1, 6.4, 7.5, 9.5_


- [-] 6. Create vehicle management routes with admin protection

  - Create `backend/routes/vehicleRoutes.js` for vehicle endpoints
  - Add GET /api/vehicles route (public) for all vehicles
  - Add GET /api/vehicles/:id route (public) for single vehicle
  - Add POST /api/vehicles route (protect + admin) for creating vehicles
  - Add PUT /api/vehicles/:id route (protect + admin) for updating vehicles


  - Add DELETE /api/vehicles/:id route (protect + admin) for deleting vehicles
  - Add vehicle routes to server.js
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 5.1, 5.2, 5.3, 5.4, 5.5, 9.3_

- [ ] 7. Create category management routes
  - Create `backend/routes/categoryRoutes.js` for category endpoints
  - Add GET /api/categories route (public)
  - Add POST /api/categories route (protect + admin)
  - Add PUT /api/categories/:id route (protect + admin)

  - Add category routes to server.js

  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 8. Update API utility with admin and booking endpoints
  - Update `frontend/src/utils/api.js` to add adminAPI object
  - Add adminAPI.getStats() method


  - Add adminAPI.getAllUsers() method
  - Add adminAPI.updateUserRole(userId, role) method
  - Add adminAPI.getAllRequests() method
  - Add adminAPI.updateRequestStatus(requestId, status) method
  - Add bookingAPI object with methods for create, getMyBookings, cancel
  - Add vehicleAPI object with methods for CRUD operations
  - _Requirements: 2.1, 3.1, 4.1, 6.3, 8.1_

- [ ] 9. Create AdminRoute component for route guarding
  - Create `frontend/src/components/AdminRoute.jsx`


  - Check if user exists and user.role === 'admin'
  - Show loading state while checking
  - Redirect to home if not admin
  - Render children if admin
  - _Requirements: 1.2, 9.1_

- [ ] 10. Update Admin Dashboard with real data and icons
  - Update `frontend/src/admin/Dashboard.jsx` to import lucide-react icons
  - Replace all emoji icons with lucide-react components
  - Add useEffect to fetch stats from API on component mount
  - Add state for stats (totalUsers, totalVehicles, totalBookings, totalRevenue)
  - Display real statistics in stat cards


  - Add useEffect to fetch recent bookings
  - Display real booking data in table
  - Implement approve/reject handlers that call API
  - Update Dashboard.css to style icons professionally
  - _Requirements: 1.1, 1.3, 1.4, 1.5, 2.2, 2.3, 2.4, 2.5, 8.3, 8.4, 8.5_

- [ ] 11. Create Vehicle Management admin page
  - Create `frontend/src/admin/VehicleManagement.jsx`
  - Fetch all vehicles from API on mount

  - Display vehicles in a table with name, brand, category, price, availability

  - Add "Add Vehicle" button that opens a modal/form
  - Create form with fields: name, brand, category (dropdown), pricePerDay, image URL, description, location
  - Implement create vehicle handler
  - Add edit button for each vehicle that opens form with pre-filled data
  - Implement update vehicle handler
  - Add delete button with confirmation
  - Implement delete vehicle handler
  - Style with black/white/grey theme


  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 12. Create Booking Management admin page
  - Create `frontend/src/admin/BookingManagement.jsx`
  - Fetch all booking requests from API on mount
  - Display bookings in table with ID, user name, vehicle name, dates, amount, status
  - Add filter/tabs for Pending, Approved, Rejected, Completed
  - Implement approve handler that calls API
  - Implement reject handler that calls API
  - Display status with color coding (pending: yellow, approved: green, rejected: red)
  - Refresh list after status updates
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 13. Create User Management admin page
  - Create `frontend/src/admin/UserManagement.jsx`
  - Fetch all users from API on mount
  - Display users in table with name, email, phone, role, registration date
  - Add filter dropdown for role (All, Admin, User)



  - Add role change dropdown for each user
  - Implement role update handler
  - Show warning when trying to demote last admin
  - Style with black/white/grey theme
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 14. Create Category Management admin page
  - Create `frontend/src/admin/CategoryManagement.jsx`

  - Fetch all categories from API on mount
  - Display categories in grid/list with name and description

  - Add "Add Category" button
  - Create form for category name and description
  - Implement create category handler
  - Add edit button for each category
  - Implement update category handler
  - Show vehicle count for each category
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_



- [ ] 15. Update admin sidebar navigation
  - Update `frontend/src/admin/Dashboard.jsx` sidebar to use proper routing
  - Replace span elements with Link components for navigation
  - Add routes for /admin, /admin/vehicles, /admin/bookings, /admin/users, /admin/categories
  - Replace emoji icons with lucide-react icons throughout sidebar
  - Update active state styling
  - _Requirements: 1.4, 1.5_




- [ ] 16. Create Vehicle Detail page for users
  - Create `frontend/src/pages/VehicleDetail.jsx`
  - Get vehicle ID from URL params
  - Fetch vehicle details from API on mount
  - Display vehicle image, name, brand, price per day, description, location
  - Show availability status
  - If vehicle available and user logged in, show booking form
  - If user not logged in, show "Login to Book" button
  - Style with black/white/grey theme
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 17. Create Booking Form component
  - Create `frontend/src/components/BookingForm.jsx`
  - Accept vehicleId and pricePerDay as props

  - Add form fields: startDate, endDate, pickupLocation, returnLocation, additionalNotes

  - Implement date validation (end date > start date, dates in future)
  - Calculate total amount based on date range and price per day
  - Display calculated amount dynamically
  - Implement submit handler that calls booking API
  - Show success message and redirect to profile on success
  - Show error message on failure
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_






- [ ] 18. Update Fleet page to link to vehicle details
  - Update `frontend/src/pages/Fleet.jsx` to fetch real vehicles from API
  - Replace mock data with API data
  - Make each vehicle card clickable linking to /vehicles/:id
  - Show availability status on cards
  - Add loading and error states
  - _Requirements: 5.1, 5.4_

- [ ] 19. Update Profile page with user bookings
  - Update `frontend/src/pages/Profile.jsx` to fetch user's bookings from API
  - Replace mock booking data with real data from API
  - Display all user bookings with vehicle details
  - Show status with color coding (pending: yellow, approved: green, rejected: red, completed: grey, cancelled: grey)
  - Add cancel button for pending bookings
  - Implement cancel handler that calls API
  - Show "No bookings yet" message if empty
  - Add "Browse Vehicles" button
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 20. Update Navbar to show Admin link conditionally
  - Update `frontend/src/components/Navbar.jsx` to check user.role

  - Show "ADMIN" link in navbar when user.role === 'admin'
  - Hide "ADMIN" link for regular users
  - Admin link should navigate to /admin
  - Use lucide-react icon instead of emoji (if any)

  - _Requirements: 1.1_


- [ ] 21. Update App routing with admin routes
  - Update `frontend/src/App.jsx` to import AdminRoute and admin pages
  - Wrap /admin route with AdminRoute component
  - Add nested routes for admin sections:
    - /admin → Dashboard
    - /admin/vehicles → VehicleManagement
    - /admin/bookings → BookingManagement
    - /admin/users → UserManagement
    - /admin/categories → CategoryManagement
  - Add route for /vehicles/:id → VehicleDetail
  - Protect admin routes with AdminRoute wrapper
  - _Requirements: 1.2_

- [ ] 22. Create shared admin layout component
  - Create `frontend/src/admin/AdminLayout.jsx` with sidebar and main content area
  - Move sidebar from Dashboard to AdminLayout
  - Use Outlet from react-router-dom for nested routes
  - Ensure consistent layout across all admin pages
  - _Requirements: 1.4_

- [ ] 23. Remove all remaining emojis from application
  - Search codebase for emoji characters
  - Replace with appropriate lucide-react icons or text
  - Update Navbar brand icon (car emoji)
  - Update any remaining UI elements with emojis
  - Ensure professional appearance throughout
  - _Requirements: 1.5, 8.5_

- [ ] 24. Add date picker component for booking form
  - Install or create date picker component (or use HTML5 date input)
  - Integrate into BookingForm for startDate and endDate
  - Add date range validation
  - Style to match black/white/grey theme
  - _Requirements: 6.1, 6.2_

- [ ] 25. Implement booking amount calculation logic
  - Create utility function to calculate days between dates
  - Calculate total amount = days * pricePerDay
  - Display calculation in booking form
  - Validate calculation on backend when creating request
  - _Requirements: 6.3_
