# Implementation Plan

- [x] 1. Create API utility module for axios configuration


  - Create `frontend/src/utils/api.js` with axios instance
  - Configure base URL from environment variable
  - Add request interceptor to attach JWT token from localStorage
  - Add response interceptor for error handling
  - Export authentication API methods (login, register, getProfile)
  - _Requirements: 1.2, 2.3, 2.5, 3.2, 4.2, 6.1, 6.2_



- [ ] 2. Implement AuthContext for global authentication state
  - Create `frontend/src/context/AuthContext.jsx` with Context and Provider
  - Define initial state (user, token, loading, error)
  - Implement login action that calls API and stores token in localStorage
  - Implement register action that calls API and stores token in localStorage
  - Implement logout action that clears token from localStorage
  - Implement checkAuth action to verify token on app load


  - Export useAuth custom hook for consuming the context
  - _Requirements: 2.5, 3.3, 3.4, 4.3, 4.4, 6.2, 6.3_

- [x] 3. Update Login page with API integration

  - Import and use AuthContext (useAuth hook)
  - Add loading state display during API call
  - Add error state display for API errors
  - Update handleSubmit to call login action from context
  - Add useNavigate hook to redirect to home on success
  - Handle API errors and display them in the UI
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 4.1, 4.2, 4.3, 4.4, 4.5_



- [ ] 4. Update Register page with API integration
  - Import and use AuthContext (useAuth hook)
  - Add loading state display during API call
  - Add error state display for API errors
  - Update handleSubmit to call register action from context
  - Add useNavigate hook to redirect to home on success


  - Handle API errors and display them in the UI
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 5. Wrap App with AuthContext Provider
  - Import AuthProvider in `frontend/src/App.jsx`
  - Wrap Router component with AuthProvider
  - Ensure AuthProvider is at the top level for global access


  - _Requirements: 3.3, 4.3_

- [ ] 6. Update Navbar component to reflect authentication state
  - Import and use AuthContext (useAuth hook)
  - Conditionally show Login/Register links when user is not logged in
  - Conditionally show Profile/Logout button when user is logged in


  - Display username when user is logged in
  - Implement logout handler that calls logout action from context
  - _Requirements: 3.4, 4.4_

- [ ] 7. Create ProtectedRoute component for route guarding
  - Create `frontend/src/components/ProtectedRoute.jsx`



  - Use AuthContext to check if user is authenticated
  - Show loading state while checking authentication
  - Redirect to /login if user is not authenticated
  - Render children if user is authenticated
  - _Requirements: 6.3, 6.4_

- [ ] 8. Update Profile page to fetch user data from API
  - Import and use AuthContext (useAuth hook)
  - Wrap Profile route with ProtectedRoute in App.jsx
  - Add useEffect to call getProfile API on component mount
  - Display user information (name, email, phone, role)

  - Handle loading and error states
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 9. Implement token persistence on app initialization
  - Add useEffect in AuthContext to run checkAuth on mount
  - Check if token exists in localStorage
  - If token exists, call getProfile API to validate and get user data
  - If token is invalid, clear it from localStorage
  - Update loading state appropriately
  - _Requirements: 6.2, 6.3, 6.4_


- [ ] 10. Create environment configuration file
  - Create `frontend/.env` file with VITE_API_URL variable
  - Set VITE_API_URL to http://localhost:5000 for development
  - Document environment variables needed
  - _Requirements: 2.5, 4.3_
