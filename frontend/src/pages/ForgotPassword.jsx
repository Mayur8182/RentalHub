import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../utils/api';
import './Auth.css';
import './ForgotPassword.css';

function ForgotPassword() {
  const [email,   setEmail]   = useState('');
  const [status,  setStatus]  = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState('');
  const [resetUrl, setResetUrl] = useState('');   // dev-only

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await authAPI.forgotPassword(email);
      setMessage(res.data.message);
      if (res.data.resetUrl) setResetUrl(res.data.resetUrl);
      setStatus('success');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="fp-icon">🔑</div>
        <h2>Forgot Password</h2>
        <p className="auth-subtitle">
          Enter your email and we'll send a reset link.
        </p>

        {status === 'success' ? (
          <div className="fp-success">
            <div className="fp-success-icon">✅</div>
            <p>{message}</p>
            {resetUrl && (
              <div className="fp-dev-link">
                <p style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>
                  Dev mode — click the link below:
                </p>
                <a href={resetUrl} style={{ fontSize: 13, wordBreak: 'break-all' }}>
                  {resetUrl}
                </a>
              </div>
            )}
            <Link to="/login" className="btn-auth" style={{ marginTop: 20, display: 'block', textAlign: 'center', textDecoration: 'none' }}>
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            {status === 'error' && (
              <div className="fp-error">{message}</div>
            )}
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                className="form-control"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={status === 'loading'}
              />
            </div>
            <button type="submit" className="btn-auth" disabled={status === 'loading'}>
              {status === 'loading' ? 'Sending…' : 'Send Reset Link'}
            </button>
            <p className="auth-footer">
              Remembered it? <Link to="/login">Back to Login</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
