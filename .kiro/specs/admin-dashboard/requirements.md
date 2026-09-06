# Requirements Document - Admin Dashboard & Role-Based Access

## Introduction

This document specifies the requirements for a comprehensive admin dashboard with role-based access control, vehicle management, booking request management, user management, and analytics. The system distinguishes between regular users and administrators, providing appropriate interfaces for each role.

## Glossary

- **Admin User**: A user with administrative privileges who can manage vehicles, bookings, and users
- **Regular User**: A standard user who can browse vehicles and make booking requests
- **Booking Request**: A rental request submitted by a user for a specific vehicle and date range
- **Vehicle Management**: CRUD operations for vehicles in the rental fleet
- **Dashboard**: The administrative interface showing statistics and management tools
- **Role-Based Access Control (RBAC)**: System that restricts access based on user role

## Requirements

### Requirement 1

**User Story:** As an admin, I want to access an admin dashboard, so that I can manage the rental platform

#### Acceptance Criteria

1. WHEN a user with admin role logs in, THE Frontend Application SHALL display an admin link in the navbar
2. WHEN a regular user tries to access the admin dashboard URL, THE Frontend Application SHALL redirect them to the home page
3. WHEN an admin accesses the dashboard, THE Frontend Application SHALL display statistics for total users, vehicles, bookings, and revenue
4. THE Admin Dashboard SHALL display navigation menu with sections for Dashboard, Vehicles, Bookings, Users, and Categories
5. THE Admin Dashboard SHALL use professional icons (SVG or icon font) instead of emoji symbols

### Requirement 2

**User Story:** As an admin, I want to view all booking requests, so that I can approve or reject them

#### Acceptance Criteria

1. WHEN an admin views the bookings section, THE Backend API SHALL return all rental requests with user and vehicle details
2. THE Admin Dashboard SHALL display a table with booking ID, user name, vehicle name, dates, amount, and status
3. WHEN an admin clicks approve on a booking, THE Backend API SHALL update the request status to Approved
4. WHEN an admin clicks reject on a booking, THE Backend API SHALL update the request status to Rejected
5. THE Admin Dashboard SHALL refresh the booking list after status updates

### Requirement 3

**User Story:** As an admin, I want to manage vehicles, so that I can add, edit, or remove vehicles from the fleet

#### Acceptance Criteria

1. WHEN an admin views the vehicles section, THE Backend API SHALL return all vehicles with their details
2. THE Admin Dashboard SHALL display a button to add new vehicles
3. WHEN an admin clicks add vehicle, THE Admin Dashboard SHALL display a form with fields for name, brand, category, price, image URL, description, and location
4. WHEN an admin submits the vehicle form, THE Backend API SHALL create or update the vehicle record
5. WHEN an admin clicks delete on a vehicle, THE Backend API SHALL remove the vehicle from the database

### Requirement 4

**User Story:** As an admin, I want to view all registered users, so that I can manage user accounts

#### Acceptance Criteria

1. WHEN an admin views the users section, THE Backend API SHALL return all users with their details excluding passwords
2. THE Admin Dashboard SHALL display a table with user name, email, phone, role, and registration date
3. THE Admin Dashboard SHALL allow filtering users by role (admin or user)
4. WHEN an admin changes a user role, THE Backend API SHALL update the user record
5. THE Backend API SHALL prevent removing the last admin user from the system

### Requirement 5

**User Story:** As a regular user, I want to browse available vehicles, so that I can choose a vehicle to rent

#### Acceptance Criteria

1. THE Frontend Application SHALL display all available vehicles on the fleet page
2. WHEN a user clicks on a vehicle, THE Frontend Application SHALL display detailed vehicle information
3. THE Frontend Application SHALL show vehicle name, brand, description, price per day, and availability status
4. WHEN a vehicle is not available, THE Frontend Application SHALL disable the booking button
5. THE Frontend Application SHALL display vehicle location information

### Requirement 6

**User Story:** As a regular user, I want to submit a booking request, so that I can rent a vehicle

#### Acceptance Criteria

1. WHEN a user clicks book on a vehicle, THE Frontend Application SHALL display a booking form
2. THE booking form SHALL include fields for start date, end date, pickup location, return location, and additional notes
3. WHEN a user submits the booking form, THE Backend API SHALL calculate the total amount based on dates and price per day
4. WHEN the booking is created, THE Backend API SHALL set the status to Pending
5. WHEN the booking is successful, THE Frontend Application SHALL redirect to the user profile showing the new request

### Requirement 7

**User Story:** As a regular user, I want to view my booking requests, so that I can track their status

#### Acceptance Criteria

1. WHEN a user accesses their profile, THE Frontend Application SHALL display all their booking requests
2. THE Frontend Application SHALL show booking ID, vehicle name, dates, amount, and status for each request
3. THE Frontend Application SHALL display status with color coding (pending: yellow, approved: green, rejected: red)
4. WHEN a user has no bookings, THE Frontend Application SHALL display a message to browse vehicles
5. THE Frontend Application SHALL allow users to cancel pending requests

### Requirement 8

**User Story:** As an admin, I want to view dashboard statistics, so that I can monitor platform performance

#### Acceptance Criteria

1. THE Backend API SHALL provide an endpoint that returns total count of users, vehicles, and bookings
2. THE Backend API SHALL calculate total revenue from approved bookings
3. THE Admin Dashboard SHALL display these statistics in card format
4. THE statistics SHALL update when the dashboard is loaded
5. THE Admin Dashboard SHALL display statistics using professional styling without emojis

### Requirement 9

**User Story:** As a developer, I want role-based access control middleware, so that admin routes are protected

#### Acceptance Criteria

1. THE Backend API SHALL provide an admin middleware that checks if user role is admin
2. WHEN a non-admin user calls an admin endpoint, THE Backend API SHALL return 403 Forbidden
3. THE Backend API SHALL apply admin middleware to vehicle create, update, delete endpoints
4. THE Backend API SHALL apply admin middleware to user management endpoints
5. THE Backend API SHALL apply admin middleware to booking status update endpoints

### Requirement 10

**User Story:** As an admin, I want to manage vehicle categories, so that I can organize the vehicle fleet

#### Acceptance Criteria

1. WHEN an admin views categories, THE Backend API SHALL return all categories
2. THE Admin Dashboard SHALL display a list of categories with vehicle count
3. THE Admin Dashboard SHALL allow creating new categories with name and description
4. WHEN a category has vehicles, THE Backend API SHALL prevent deletion
5. THE Admin Dashboard SHALL allow editing category details
