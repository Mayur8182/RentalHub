import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../utils/api';
import './Auth.css';
import './ForgotPassword.css';

function ResetPassword() {
  const { token }      = useParams();
  const navigate       = useNavigate();
  const [newPassword,  setNewPassword]  = useState('');
  const [confirm,      setConfirm]      = useState('');
  const [showPwd,      setShowPwd]      = useState(false);
  const [status,       setStatus]       = useState('idle');
  const [error,        setError]        = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (newPassword !== confirm) { setError('Passwords do not match.'); return; }

    setStatus('loading');
    try {
      await authAPI.resetPassword(token, newPassword);
      setStatus('success');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed. The link may have expired.');
      setStatus('idle');
    }
  };

  if (status === 'success') {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div className="fp-success-icon">🎉</div>
          <h2>Password Reset!</h2>
          <p className="auth-subtitle">Your password has been updated. Redirecting to login…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="fp-icon">🔒</div>
        <h2>Set New Password</h2>
        <p className="auth-subtitle">Choose a strong password for your account.</p>

        {error && <div className="fp-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group" style={{ position: 'relative' }}>
            <label>New Password</label>
            <input
              type={showPwd ? 'text' : 'password'}
              className="form-control"
              placeholder="Min. 6 characters"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
              disabled={status === 'loading'}
            />
            <button type="button" onClick={() => setShowPwd(s => !s)}
              style={{ position: 'absolute', right: 12, bottom: 12, background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontSize: 13 }}>
              {showPwd ? 'Hide' : 'Show'}
            </button>
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type={showPwd ? 'text' : 'password'}
              className="form-control"
              placeholder="Repeat password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              disabled={status === 'loading'}
            />
          </div>

          {/* Password strength bar */}
          {newPassword && (
            <div style={{ marginTop: -8, marginBottom: 4 }}>
              <div style={{ height: 4, borderRadius: 2, background: '#E8E8E8', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 2, transition: 'width 0.3s',
                  width: newPassword.length >= 10 ? '100%' : newPassword.length >= 8 ? '66%' : newPassword.length >= 6 ? '33%' : '10%',
                  background: newPassword.length >= 10 ? '#22C55E' : newPassword.length >= 8 ? '#F59E0B' : '#EF4444',
                }} />
              </div>
              <p style={{ fontSize: 11, color: '#888', marginTop: 4 }}>
                {newPassword.length >= 10 ? 'Strong' : newPassword.length >= 8 ? 'Fair' : 'Weak'}
              </p>
            </div>
          )}

          <button type="submit" className="btn-auth" disabled={status === 'loading'}>
            {status === 'loading' ? 'Saving…' : 'Reset Password'}
          </button>
          <p className="auth-footer">
            <Link to="/login">Back to Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
