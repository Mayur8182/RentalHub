import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { couponAPI } from '../utils/api';
import './Auth.css';
import './Register.css';

function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
  const [couponCode,    setCouponCode]    = useState('');
  const [couponResult,  setCouponResult]  = useState(null);
  const [couponError,   setCouponError]   = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [localError,    setLocalError]    = useState('');
  const [validationError, setValidationError] = useState('');

  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setLocalError(''); setValidationError('');
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponError(''); setCouponLoading(true); setCouponResult(null);
    try {
      const res = await couponAPI.validate(couponCode.trim(), 0);
      setCouponResult(res.data);
    } catch (err) {
      setCouponError(err.response?.data?.message || 'Invalid coupon code.');
    } finally { setCouponLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(''); setValidationError('');
    if (formData.password.length < 6) {
      setValidationError('Password must be at least 6 characters long');
      return;
    }
    const result = await register(formData.name, formData.email, formData.password, formData.phone);
    if (result.success) {
      navigate('/');
    } else {
      setLocalError(result.error);
    }
  };

  const errorMessage = localError || validationError;

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Create Account</h2>
        <p className="auth-subtitle">Join RentalHub and start renting today</p>

        {errorMessage && (
          <div style={{ backgroundColor: '#fee', color: '#c33', padding: '12px', borderRadius: '4px', marginBottom: '20px', fontSize: '14px', border: '1px solid #fcc' }}>
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" name="name" placeholder="Your full name" className="form-control"
              value={formData.name} onChange={handleChange} required disabled={loading} />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" name="email" placeholder="you@example.com" className="form-control"
              value={formData.email} onChange={handleChange} required disabled={loading} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" placeholder="Create a password (min 6 chars)" className="form-control"
              value={formData.password} onChange={handleChange} required disabled={loading} minLength="6" />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input type="tel" name="phone" placeholder="+91 XXXXX XXXXX" className="form-control"
              value={formData.phone} onChange={handleChange} required disabled={loading} />
          </div>

          {/* Welcome coupon */}
          <div className="reg-coupon-section">
            <label className="reg-coupon-label">🎁 Have a welcome coupon?</label>
            <div className="reg-coupon-row">
              <input
                type="text"
                className="form-control reg-coupon-input"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponResult(null); setCouponError(''); }}
                disabled={loading || couponLoading}
              />
              <button type="button" className="reg-coupon-btn" onClick={handleApplyCoupon}
                disabled={!couponCode.trim() || couponLoading || loading}>
                {couponLoading ? '…' : 'Apply'}
              </button>
            </div>
            {couponResult && (
              <div className="reg-coupon-success">
                ✅ <strong>{couponResult.coupon.code}</strong> is valid! You'll get{' '}
                {couponResult.coupon.discountType === 'percentage'
                  ? `${couponResult.coupon.discountValue}% off`
                  : `₹${couponResult.coupon.discountValue} off`}{' '}
                on your first booking.
              </div>
            )}
            {couponError && <div className="reg-coupon-error">{couponError}</div>}
          </div>

          <button type="submit" className="btn-auth" disabled={loading}>
            {loading ? 'Creating Account…' : 'Create Account'}
          </button>
        </form>

        <div className="auth-divider"><span>OR</span></div>
        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
