import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookingAPI, authAPI } from '../utils/api';
import './Profile.css';

const fmtDate = (s) => new Date(s).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
const fmtShort = (s) => new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const STATUS_STYLE = {
  Pending:   { bg: '#FEF3C7', color: '#92400E' },
  Approved:  { bg: '#D1FAE5', color: '#065F46' },
  Active:    { bg: '#DBEAFE', color: '#1E40AF' },
  Completed: { bg: '#F3F4F6', color: '#374151' },
  Rejected:  { bg: '#FEE2E2', color: '#991B1B' },
  Cancelled: { bg: '#F3F4F6', color: '#6B7280' },
};

function Profile() {
  const { user } = useAuth();
  const [tab,      setTab]      = useState('overview');
  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(true);

  // Change-password form state
  const [cpForm,   setCpForm]   = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [cpStatus, setCpStatus] = useState('idle');
  const [cpMsg,    setCpMsg]    = useState('');
  const [showPwd,  setShowPwd]  = useState(false);

  useEffect(() => {
    if (user) fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await bookingAPI.getMyBookings();
      setBookings(res.data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try { await bookingAPI.cancel(id); fetchBookings(); }
    catch (err) { alert(err.response?.data?.message || 'Failed'); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setCpMsg(''); setCpStatus('loading');
    if (cpForm.newPassword.length < 6) { setCpMsg('New password must be at least 6 characters.'); setCpStatus('error'); return; }
    if (cpForm.newPassword !== cpForm.confirm) { setCpMsg('Passwords do not match.'); setCpStatus('error'); return; }
    try {
      await authAPI.changePassword({ currentPassword: cpForm.currentPassword, newPassword: cpForm.newPassword });
      setCpStatus('success'); setCpMsg('Password changed successfully!');
      setCpForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      setCpStatus('error'); setCpMsg(err.response?.data?.message || 'Failed to change password.');
    }
  };

  // Stats
  const totalSpent   = bookings.filter(b => ['Approved','Active','Completed'].includes(b.status)).reduce((s,b) => s + b.totalAmount, 0);
  const completed    = bookings.filter(b => b.status === 'Completed').length;
  const active       = bookings.filter(b => ['Approved','Active'].includes(b.status)).length;

  const TABS = [
    { id: 'overview', label: '👤 Overview' },
    { id: 'bookings', label: '📋 Bookings' },
    { id: 'security', label: '🔒 Security' },
  ];

  return (
    <div className="profile-page">
      <div className="container">

        {/* ── Header ────────────────────────────────────────────── */}
        <div className="profile-header">
          <div className="profile-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
          <div className="profile-info">
            <h2>{user?.name}</h2>
            <p>{user?.email} · Member since {fmtDate(user?.createdAt || new Date())}</p>
            <span style={{
              display: 'inline-block', marginTop: 6, padding: '3px 12px',
              borderRadius: 12, fontSize: 11, fontWeight: 700,
              background: user?.role === 'admin' ? '#111' : '#F3F4F6',
              color: user?.role === 'admin' ? '#fff' : '#374151',
            }}>
              {user?.role?.toUpperCase()}
            </span>
          </div>
        </div>

        {/* ── Stat strip ────────────────────────────────────────── */}
        <div className="profile-stats-row">
          {[
            ['Total Bookings', bookings.length,    '#111'],
            ['Active',         active,             '#3B82F6'],
            ['Completed',      completed,          '#22C55E'],
            ['Total Spent',    `₹${totalSpent.toLocaleString('en-IN')}`, '#8B5CF6'],
          ].map(([label, val, color]) => (
            <div key={label} className="profile-stat-card">
              <div className="profile-stat-val" style={{ color }}>{val}</div>
              <div className="profile-stat-label">{label}</div>
            </div>
          ))}
        </div>

        {/* ── Tabs ──────────────────────────────────────────────── */}
        <div className="profile-tabs">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`profile-tab-btn ${tab === t.id ? 'active' : ''}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Overview ──────────────────────────────────────────── */}
        {tab === 'overview' && (
          <div className="profile-card">
            <h3>My Profile</h3>
            {[
              ['Name',    user?.name],
              ['Email',   user?.email],
              ['Phone',   user?.phone || 'Not provided'],
              ['Role',    user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)],
              ['Joined',  fmtDate(user?.createdAt || new Date())],
            ].map(([label, value]) => (
              <div key={label} className="profile-detail">
                <span className="label">{label}</span>
                <span className="value">{value}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── Bookings ──────────────────────────────────────────── */}
        {tab === 'bookings' && (
          <div className="profile-card">
            <h3>My Bookings</h3>
            {loading ? (
              <p style={{ color: '#888', padding: '20px 0' }}>Loading…</p>
            ) : bookings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <p style={{ color: '#555', marginBottom: 20 }}>No bookings yet.</p>
                <Link to="/fleet" className="btn btn-primary">Browse Vehicles</Link>
              </div>
            ) : (
              <table className="requests-table">
                <thead>
                  <tr>
                    <th>Vehicle</th><th>Start</th><th>End</th><th>Amount</th><th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(b => {
                    const ss = STATUS_STYLE[b.status] || {};
                    return (
                      <tr key={b._id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{b.vehicleId?.name || 'N/A'}</div>
                          <div style={{ fontSize: 12, color: '#9CA3AF' }}>{b.vehicleId?.brand}</div>
                        </td>
                        <td>{fmtShort(b.startDate)}</td>
                        <td>{fmtShort(b.endDate)}</td>
                        <td style={{ fontWeight: 700 }}>₹{b.totalAmount.toLocaleString('en-IN')}</td>
                        <td>
                          <span style={{ ...ss, display: 'inline-block', padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700 }}>
                            {b.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            <Link to={`/bookings/${b._id}`}
                              style={{ fontSize: 12, padding: '4px 10px', background: '#F3F4F6', border: '1px solid #E8E8E8', borderRadius: 4, textDecoration: 'none', color: '#374151', fontWeight: 600 }}>
                              Details
                            </Link>
                            {b.status === 'Pending' && (
                              <button onClick={() => handleCancel(b._id)}
                                style={{ fontSize: 12, padding: '4px 10px', background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: 4, color: '#B91C1C', fontWeight: 600, cursor: 'pointer' }}>
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── Security (Change Password) ─────────────────────────── */}
        {tab === 'security' && (
          <div className="profile-card" style={{ maxWidth: 480 }}>
            <h3>Change Password</h3>

            {cpStatus === 'success' && (
              <div style={{ background: '#D1FAE5', color: '#065F46', border: '1px solid #A7F3D0', padding: '10px 14px', borderRadius: 6, marginBottom: 20, fontSize: 14 }}>
                {cpMsg}
              </div>
            )}
            {cpStatus === 'error' && (
              <div style={{ background: '#FEE2E2', color: '#B91C1C', border: '1px solid #FECACA', padding: '10px 14px', borderRadius: 6, marginBottom: 20, fontSize: 14 }}>
                {cpMsg}
              </div>
            )}

            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                ['Current Password', 'currentPassword'],
                ['New Password',     'newPassword'],
                ['Confirm Password', 'confirm'],
              ].map(([label, key]) => (
                <div key={key}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {label}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPwd ? 'text' : 'password'}
                      className="form-control"
                      value={cpForm[key]}
                      onChange={e => setCpForm(f => ({ ...f, [key]: e.target.value }))}
                      required
                      disabled={cpStatus === 'loading'}
                    />
                    {key === 'currentPassword' && (
                      <button type="button" onClick={() => setShowPwd(s => !s)}
                        style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontSize: 12 }}>
                        {showPwd ? 'Hide' : 'Show'}
                      </button>
                    )}
                  </div>
                  {/* Strength bar for new password */}
                  {key === 'newPassword' && cpForm.newPassword && (
                    <div style={{ marginTop: 6 }}>
                      <div style={{ height: 3, background: '#E8E8E8', borderRadius: 2 }}>
                        <div style={{
                          height: '100%', borderRadius: 2, transition: 'width 0.3s',
                          width: cpForm.newPassword.length >= 10 ? '100%' : cpForm.newPassword.length >= 8 ? '66%' : '33%',
                          background: cpForm.newPassword.length >= 10 ? '#22C55E' : cpForm.newPassword.length >= 8 ? '#F59E0B' : '#EF4444',
                        }} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <button type="submit" className="btn btn-primary" disabled={cpStatus === 'loading'} style={{ marginTop: 4 }}>
                {cpStatus === 'loading' ? 'Saving…' : 'Change Password'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
