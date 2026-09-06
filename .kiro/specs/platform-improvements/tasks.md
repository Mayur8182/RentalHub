# Implementation Plan

## Feature 1: Admin Layout Footer Fix

- [x] 1. Fix footer visibility on admin routes


  - Import useLocation hook from react-router-dom in App.jsx
  - Add conditional logic to check if current path starts with '/admin'
  - Conditionally render Footer component only for non-admin routes
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

## Feature 2: Contact Query Management System



- [x] 2. Create Contact data model and backend infrastructure


  - _Requirements: 2.1, 2.2_

- [ ] 2.1 Create Contact model
  - Create backend/models/Contact.js with Mongoose schema


  - Define fields: name, email, phone, message, status (enum: pending/resolved)
  - Add timestamps and indexes for status and createdAt fields
  - _Requirements: 2.1_

- [x] 2.2 Create contact controller


  - Create backend/controllers/contactController.js
  - Implement createContact function for public form submission with validation
  - Implement getAllContacts function with status filtering (pending/resolved/all)
  - Implement updateContactStatus function for admin status updates
  - _Requirements: 2.1, 2.2, 2.4, 2.5_



- [ ] 2.3 Create contact routes
  - Create backend/routes/contactRoutes.js
  - Add POST /api/contacts route (public endpoint)


  - Add GET /api/admin/contacts route with protect and admin middleware
  - Add PATCH /api/admin/contacts/:id/status route with protect and admin middleware
  - Import and use contactRoutes in server.js
  - _Requirements: 2.1, 2.2, 2.4, 2.5_

- [-] 3. Update admin statistics to include contact count

  - Modify getAdminStats in adminController.js to count pending contacts
  - Add pendingContacts field to stats response


  - Update frontend Dashboard.jsx to display pending contacts stat
  - _Requirements: 2.7_

- [ ] 4. Enhance frontend Contact form with API integration
  - Update frontend/src/pages/Contact.jsx to call POST /api/contacts endpoint

  - Add loading state during submission
  - Add error handling with user-friendly messages
  - Show success confirmation message after submission
  - Reset form data after successful submission
  - _Requirements: 2.1, 2.6_

- [x] 5. Create admin Contact Management interface

  - _Requirements: 2.2, 2.3, 2.4, 2.5_

- [ ] 5.1 Create ContactManagement component
  - Create frontend/src/admin/ContactManagement.jsx
  - Add state management for contacts list, filter, loading, and error
  - Implement useEffect to fetch contacts from GET /api/admin/contacts endpoint



  - Create filter tabs for All, Pending, and Resolved statuses
  - _Requirements: 2.2, 2.5_

- [x] 5.2 Build contact list UI


  - Create table with columns: Name, Email, Phone, Message (truncated), Date, Status, Actions
  - Add color-coded status badges (orange for pending, green for resolved)
  - Implement expandable message view for long messages
  - Add empty state display when no contacts exist
  - Style using existing admin CSS patterns
  - _Requirements: 2.2, 2.3, 2.4_

- [x] 5.3 Implement status update functionality


  - Create handleStatusChange function to call PATCH /api/admin/contacts/:id/status
  - Add Mark as Resolved / Mark as Pending buttons
  - Refresh contact list after status update
  - Add error handling for failed status updates
  - _Requirements: 2.4_

- [ ] 5.4 Add admin route for contact management
  - Add /admin/contacts route in App.jsx using AdminRoute wrapper


  - Add "Contacts" link to admin navigation sidebar
  - _Requirements: 2.2_

## Feature 3: Home Page Enhancement

- [ ] 6. Modernize Banner/Hero section


  - Update frontend/src/components/Banner.jsx with modern hero design
  - Add large, bold headline with value proposition text
  - Add compelling subheading explaining key benefits
  - Create two CTA buttons: "Browse Fleet" (navigates to /fleet) and "Learn More" (scrolls to features)
  - Apply gradient background or full-width image with overlay
  - Increase font sizes and improve typography hierarchy
  - Add proper spacing and ensure responsive design
  - _Requirements: 3.1, 3.5, 3.6_

- [ ] 7. Remove emojis and modernize Funfacts component
  - Update frontend/src/components/Funfacts.jsx to remove all emoji symbols
  - Create modern card-based layout for statistics display
  - Display stats: 500+ Vehicles, 10,000+ Happy Customers, 15+ Years, 98% Satisfaction
  - Add card hover effects with subtle shadow and transform
  - Use large, bold numbers with descriptive labels
  - Implement responsive grid layout (auto-fit, minmax pattern)
  - Apply modern styling with proper spacing and visual hierarchy
  - _Requirements: 3.2, 3.3, 3.4, 3.5, 3.6_

- [ ] 8. Clean up Blog component and remove emoji usage
  - Update frontend/src/components/Blog.jsx to remove emoji symbols
  - Replace emojis with text or remove decorative elements
  - Improve card hover effects and transitions
  - Enhance spacing and typography
  - Ensure responsive design is maintained
  - _Requirements: 3.2, 3.5, 3.6_

- [ ] 9. Enhance Request/Features section
  - Update frontend/src/components/Request.jsx to remove any remaining emojis
  - Replace with text-based labels or simple visual elements
  - Improve card layouts with better spacing
  - Add subtle hover animations for interactive feel
  - Ensure visual consistency with other modernized components
  - _Requirements: 3.2, 3.4, 3.5, 3.6_

- [ ] 10. Performance optimization and testing
  - _Requirements: 3.7_

- [ ] 10.1 Optimize home page images
  - Compress and optimize all images used in home page components
  - Implement lazy loading for below-fold images
  - Use appropriate image formats (WebP with fallbacks)
  - _Requirements: 3.7_

- [ ] 10.2 Test responsive design
  - Test home page on mobile devices (320px, 375px, 414px widths)
  - Test on tablet devices (768px, 1024px widths)
  - Test on desktop (1280px, 1920px widths)
  - Verify all interactive elements work on touch devices
  - _Requirements: 3.5_

- [ ] 10.3 Verify page load performance
  - Test page load time on standard connection
  - Verify target of under 3 seconds is achieved
  - Check bundle size and optimize if needed
  - _Requirements: 3.7_
