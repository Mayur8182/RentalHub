import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './context/AuthContext';
import { FavoritesProvider } from './context/FavoritesContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import Fleet from './pages/Fleet';
import VehicleDetail from './pages/VehicleDetail';
import About from './pages/About';
import Team from './pages/Team';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import MyBookings from './pages/MyBookings';
import Favorites from './pages/Favorites';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import BookingDetail from './pages/BookingDetail';
import FAQ from './pages/FAQ';
import NotFound from './pages/NotFound';
import InvoicePage from './pages/InvoicePage';

import AdminDashboard from './admin/Dashboard';
import VehicleManagement from './admin/VehicleManagement';
import BookingManagement from './admin/BookingManagement';
import RevenueManagement from './admin/RevenueManagement';
import UserManagement from './admin/UserManagement';
import CategoryManagement from './admin/CategoryManagement';
import ContactManagement from './admin/ContactManagement';
import ActivityLogPage from './admin/ActivityLog';
import CouponManagement from './admin/CouponManagement';

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="app-container">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/fleet" element={<Fleet />} />
          <Route path="/vehicles/:id" element={<VehicleDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/team" element={<Team />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/favorites"         element={<Favorites />} />
          <Route path="/forgot-password"   element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/faq"               element={<FAQ />} />
          <Route 
            path="/bookings/:id" 
            element={
              <ProtectedRoute>
                <BookingDetail />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/invoice/:id" 
            element={
              <ProtectedRoute>
                <InvoicePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/my-bookings" 
            element={
              <ProtectedRoute>
                <MyBookings />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/vehicles" 
            element={
              <AdminRoute>
                <VehicleManagement />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/bookings" 
            element={
              <AdminRoute>
                <BookingManagement />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/revenue" 
            element={
              <AdminRoute>
                <RevenueManagement />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/users" 
            element={
              <AdminRoute>
                <UserManagement />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/categories" 
            element={
              <AdminRoute>
                <CategoryManagement />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/contacts" 
            element={
              <AdminRoute>
                <ContactManagement />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/activity" 
            element={
              <AdminRoute>
                <ActivityLogPage />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/coupons" 
            element={
              <AdminRoute>
                <CouponManagement />
              </AdminRoute>
            } 
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <FavoritesProvider>
        <Router>
          <AppContent />
        </Router>
      </FavoritesProvider>
    </AuthProvider>
  );
}

export default App;
