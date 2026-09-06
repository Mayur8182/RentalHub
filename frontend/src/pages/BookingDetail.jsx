import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { bookingAPI } from '../utils/api';
import InvoiceModal from '../components/InvoiceModal';
import { useAuth } from '../context/AuthContext';
import './BookingDetail.css';

const fmtDate = (s) => new Date(s).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
const fmt     = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

const STATUS_STYLE = {
  Pending:   { bg: '#FEF3C7', color: '#92400E', icon: '⏳' },
  Approved:  { bg: '#D1FAE5', color: '#065F46', icon: '✅' },
  Active:    { bg: '#DBEAFE', color: '#1E40AF', icon: '🚗' },
  Completed: { bg: '#F3F4F6', color: '#374151', icon: '🏁' },
  Rejected:  { bg: '#FEE2E2', color: '#991B1B', icon: '❌' },
  Cancelled: { bg: '#F3F4F6', color: '#6B7280', icon: '🚫' },
};

function BookingDetail() {
  const { id }        = useParams();
  const { user }      = useAuth();
  const navigate      = useNavigate();
  const [booking,     setBooking]    = useState(null);
  const [loading,     setLoading]    = useState(true);
  const [error,       setError]      = useState('');
  const [showInvoice, setShowInvoice] = useState(false);

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const res = await bookingAPI.getById(id);
      setBooking(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking not found.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await bookingAPI.cancel(id);
      fetchBooking();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel.');
    }
  };

  if (loading) {
    return (
      <div className="bd-page">
        <div className="container">
          <div className="bd-loading">
            <div className="bd-spinner" />
            <p>Loading booking details…</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="bd-page">
        <div className="container">
          <div className="bd-error">
            <div className="bd-error-icon">📋</div>
            <h2>Booking Not Found</h2>
            <p>{error}</p>
            <Link to="/my-bookings" className="btn btn-primary">My Bookings</Link>
          </div>
        </div>
      </div>
    );
  }

  const days = Math.max(1, Math.ceil((new Date(booking.endDate) - new Date(booking.startDate)) / 86400000));
  const ss   = STATUS_STYLE[booking.status] || { bg: '#F3F4F6', color: '#374151', icon: '•' };

  return (
    <div className="bd-page">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="bd-breadcrumb">
          <Link to="/">Home</Link><span>/</span>
          <Link to="/my-bookings">My Bookings</Link><span>/</span>
          <span>#{id.slice(-6).toUpperCase()}</span>
        </nav>

        <div className="bd-layout">
          {/* ── Left: booking details ───────────────────────────── */}
          <div className="bd-left">

            {/* Status banner */}
            <div className="bd-status-banner" style={{ background: ss.bg, color: ss.color }}>
              <span className="bd-status-icon">{ss.icon}</span>
              <div>
                <div className="bd-status-label">Booking Status</div>
                <div className="bd-status-value">{booking.status}</div>
              </div>
              <div className="bd-booking-id">#{id.slice(-6).toUpperCase()}</div>
            </div>

            {/* Vehicle card */}
            {booking.vehicleId && (
              <div className="bd-section">
                <h3 className="bd-section-title">Vehicle</h3>
                <div className="bd-vehicle-row">
                  <img
                    src={booking.vehicleId.image}
                    alt={booking.vehicleId.name}
                    className="bd-vehicle-img"
                    onError={e => { e.target.src = 'https://via.placeholder.com/120x80?text=Car'; }}
                  />
                  <div>
                    <div className="bd-vehicle-name">{booking.vehicleId.brand} {booking.vehicleId.name}</div>
                    {booking.vehicleId.location && <div className="bd-vehicle-detail">📍 {booking.vehicleId.location}</div>}
                    {booking.vehicleId.transmission && (
                      <div className="bd-vehicle-specs">
                        {booking.vehicleId.seats && <span>{booking.vehicleId.seats} seats</span>}
                        {booking.vehicleId.transmission && <span>{booking.vehicleId.transmission}</span>}
                        {booking.vehicleId.fuel && <span>{booking.vehicleId.fuel}</span>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Rental period */}
            <div className="bd-section">
              <h3 className="bd-section-title">Rental Period</h3>
              <div className="bd-period-grid">
                <div className="bd-period-item">
                  <div className="bd-period-label">Pickup Date</div>
                  <div className="bd-period-value">{fmtDate(booking.startDate)}</div>
                </div>
                <div className="bd-period-arrow">→</div>
                <div className="bd-period-item">
                  <div className="bd-period-label">Return Date</div>
                  <div className="bd-period-value">{fmtDate(booking.endDate)}</div>
                </div>
                <div className="bd-period-item" style={{ marginLeft: 'auto' }}>
                  <div className="bd-period-label">Duration</div>
                  <div className="bd-period-value" style={{ color: '#7C3AED' }}>{days} day{days !== 1 ? 's' : ''}</div>
                </div>
              </div>
            </div>

            {/* Locations / notes */}
            {(booking.pickupLocation || booking.returnLocation || booking.additionalNotes) && (
              <div className="bd-section">
                <h3 className="bd-section-title">Locations & Details</h3>
                {booking.pickupLocation  && <div className="bd-detail-row"><span>📍 Pickup</span><span>{booking.pickupLocation}</span></div>}
                {booking.returnLocation && booking.returnLocation !== booking.pickupLocation && (
                  <div className="bd-detail-row"><span>🏁 Return</span><span>{booking.returnLocation}</span></div>
                )}
                {booking.returnLocation === booking.pickupLocation && (
                  <div className="bd-detail-row"><span>🏁 Return</span><span>Same as pickup</span></div>
                )}
                {booking.additionalNotes && <div className="bd-detail-row"><span>📋 Notes</span><span>{booking.additionalNotes}</span></div>}
              </div>
            )}

            {/* Pickup & Return Status */}
            {['Approved','Active','Completed'].includes(booking.status) && (
              <div className="bd-section">
                <h3 className="bd-section-title">Vehicle Status</h3>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <div className="bd-vehicle-status-badge" style={{
                    background: booking.vehiclePickedUp ? '#D1FAE5' : '#FEF3C7',
                    color:      booking.vehiclePickedUp ? '#065F46' : '#92400E',
                  }}>
                    <span style={{ fontSize: 20 }}>{booking.vehiclePickedUp ? '🚗' : '⏳'}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>
                        {booking.vehiclePickedUp ? 'Picked Up' : 'Awaiting Pickup'}
                      </div>
                      {booking.pickedUpAt && (
                        <div style={{ fontSize: 12, opacity: 0.8 }}>{fmtDate(booking.pickedUpAt)}</div>
                      )}
                    </div>
                  </div>

                  <div className="bd-vehicle-status-badge" style={{
                    background: booking.vehicleReturned ? '#D1FAE5' : '#FEE2E2',
                    color:      booking.vehicleReturned ? '#065F46' : '#991B1B',
                  }}>
                    <span style={{ fontSize: 20 }}>{booking.vehicleReturned ? '✅' : '🔴'}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>
                        {booking.vehicleReturned ? 'Returned' : 'Not Yet Returned'}
                      </div>
                      {booking.returnedAt && (
                        <div style={{ fontSize: 12, opacity: 0.8 }}>{fmtDate(booking.returnedAt)}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="bd-section">
              <h3 className="bd-section-title">Timeline</h3>
              <div className="bd-timeline">
                {[
                  { icon: '📝', label: 'Booking Created',  date: booking.createdAt, done: true },
                  { icon: '✅', label: 'Approved',          date: null,              done: ['Approved','Active','Completed'].includes(booking.status) },
                  { icon: '🚗', label: 'Vehicle Picked Up', date: booking.pickedUpAt, done: booking.vehiclePickedUp },
                  { icon: '🏁', label: 'Vehicle Returned',  date: booking.returnedAt, done: booking.vehicleReturned },
                  { icon: '🎉', label: 'Completed',          date: null,              done: booking.status === 'Completed' },
                ].map((step, i) => (
                  <div key={i} className={`bd-step ${step.done ? 'done' : ''}`}>
                    <div className="bd-step-dot">{step.icon}</div>
                    <div className="bd-step-label">{step.label}</div>
                    {step.date && <div className="bd-step-date">{fmtDate(step.date)}</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right: summary card ─────────────────────────────── */}
          <div className="bd-right">
            <div className="bd-summary-card">
              <h3 className="bd-summary-title">Summary</h3>

              <div className="bd-summary-row">
                <span>Rate</span>
                <span>{fmt(booking.vehicleId?.pricePerDay ?? 0)} / day</span>
              </div>
              <div className="bd-summary-row">
                <span>Duration</span>
                <span>{days} day{days !== 1 ? 's' : ''}</span>
              </div>
              <div className="bd-summary-divider" />
              <div className="bd-summary-row bd-summary-total">
                <span>Total</span>
                <span>{fmt(booking.totalAmount)}</span>
              </div>

              <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {!['Pending','Cancelled','Rejected'].includes(booking.status) && (
                  <button className="btn btn-primary" onClick={() => setShowInvoice(true)}>
                    🧾 View Invoice
                  </button>
                )}
                {!['Pending','Cancelled','Rejected'].includes(booking.status) && (
                  <Link to={`/invoice/${id}`}
                    style={{ display: 'block', textAlign: 'center', padding: '10px', background: '#EDE9FE', borderRadius: 4, color: '#6D28D9', textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
                    🖨️ Download PDF Invoice
                  </Link>
                )}
                {booking.status === 'Pending' && (
                  <button onClick={handleCancel}
                    style={{ padding: '12px', background: '#FEE2E2', color: '#B91C1C', border: '1px solid #FECACA', borderRadius: 4, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
                    Cancel Booking
                  </button>
                )}
                <Link to="/my-bookings"
                  style={{ display: 'block', textAlign: 'center', padding: '10px', background: '#F3F4F6', borderRadius: 4, color: '#374151', textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
                  ← All Bookings
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showInvoice && (
        <InvoiceModal booking={booking} user={user} onClose={() => setShowInvoice(false)} />
      )}
    </div>
  );
}

export default BookingDetail;
