import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookingAPI, reviewAPI } from '../utils/api';
import StarRating from '../components/StarRating';
import InvoiceModal from '../components/InvoiceModal';
import './Profile.css';
import './MyBookings.css';

function ReviewModal({ booking, onClose, onSubmitted }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { setError('Please select a star rating.'); return; }
    if (!comment.trim()) { setError('Please write a short review.'); return; }

    try {
      setLoading(true);
      setError('');
      await reviewAPI.create({ bookingId: booking._id, rating, comment: comment.trim() });
      onSubmitted();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review.');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Rate your experience</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <p className="modal-vehicle-name">
          {booking.vehicleId?.name} · {booking.vehicleId?.brand}
        </p>

        {error && <div className="modal-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Star picker */}
          <div className="modal-stars-wrap">
            <StarRating value={rating} onChange={setRating} size="lg" />
            {rating > 0 && (
              <span className="modal-rating-label">
                {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
              </span>
            )}
          </div>

          {/* Comment */}
          <textarea
            className="form-control modal-textarea"
            placeholder="Write a review…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            maxLength={1000}
            disabled={loading}
            required
          />
          <p className="modal-char-count">{comment.length} / 1000</p>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading || rating === 0}>
              {loading ? 'Submitting…' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MyBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [filteredBookings, setFilteredBookings] = useState([]);

  // Track which bookings already have a review  { bookingId: true }
  const [reviewed, setReviewed] = useState({});
  // Modal state
  const [reviewTarget, setReviewTarget] = useState(null);
  const [invoiceTarget, setInvoiceTarget] = useState(null);

  useEffect(() => {
    if (user) fetchBookings();
  }, [user]);

  useEffect(() => {
    setFilteredBookings(
      filterStatus === 'All'
        ? bookings
        : bookings.filter((b) => b.status === filterStatus)
    );
  }, [filterStatus, bookings]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await bookingAPI.getMyBookings();
      const data = res.data;
      setBookings(data);
      setFilteredBookings(data);

      // Check review status for all completed bookings in parallel
      const completed = data.filter((b) => b.status === 'Completed');
      const checks = await Promise.all(
        completed.map((b) =>
          reviewAPI.checkReviewed(b._id).then((r) => ({ id: b._id, reviewed: r.data.reviewed }))
        )
      );
      const map = {};
      checks.forEach(({ id, reviewed }) => { map[id] = reviewed; });
      setReviewed(map);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking request?')) return;
    try {
      await bookingAPI.cancel(bookingId);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const statusClass = { Pending: 'pending', Approved: 'approved', Active: 'active', Completed: 'completed', Rejected: 'rejected', Cancelled: 'cancelled' };

  const stats = {
    total:     bookings.length,
    pending:   bookings.filter((b) => b.status === 'Pending').length,
    approved:  bookings.filter((b) => b.status === 'Approved').length,
    active:    bookings.filter((b) => b.status === 'Active').length,
    completed: bookings.filter((b) => b.status === 'Completed').length,
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', fontSize: '18px', color: '#555' }}>
        Loading your bookings…
      </div>
    );
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 76px)', backgroundColor: '#F4F1E8', padding: '40px 0' }}>
      <div className="container">
        <h1 style={{ fontSize: '32px', marginBottom: '8px', fontWeight: '700' }}>My Bookings</h1>
        <p style={{ color: '#555', marginBottom: '30px' }}>Track and manage all your vehicle rental bookings</p>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
          {[['Total Bookings', stats.total, '#111'], ['Pending', stats.pending, '#FDB022'], ['Approved', stats.approved, '#28A745'], ['Completed', stats.completed, '#6C757D']].map(([label, val, color]) => (
            <div key={label} style={{ backgroundColor: '#FFF', padding: '20px', borderRadius: '4px', border: '1px solid #E8E8E8' }}>
              <p style={{ fontSize: '14px', color: '#555', marginBottom: '8px' }}>{label}</p>
              <p style={{ fontSize: '28px', fontWeight: '700', color }}>{val}</p>
            </div>
          ))}
        </div>

        {/* Filter buttons */}
        <div style={{ marginBottom: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {['All', 'Pending', 'Approved', 'Active', 'Completed', 'Rejected', 'Cancelled'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              style={{
                padding: '8px 16px',
                border: filterStatus === s ? '2px solid #111' : '1px solid #E8E8E8',
                background: filterStatus === s ? '#111' : '#FFF',
                color: filterStatus === s ? '#FFF' : '#111',
                cursor: 'pointer', borderRadius: '4px', fontSize: '14px', fontWeight: '600',
              }}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Table */}
        <div style={{ backgroundColor: '#FFF', padding: '24px', borderRadius: '4px', border: '1px solid #E8E8E8' }}>
          {filteredBookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <p style={{ color: '#555', marginBottom: '20px', fontSize: '16px' }}>
                {bookings.length === 0 ? "You haven't made any booking requests yet." : `No ${filterStatus.toLowerCase()} bookings found.`}
              </p>
              <Link to="/fleet" className="btn btn-primary">Browse Vehicles</Link>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Vehicle</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking._id}>
                    <td>{booking._id.slice(-6).toUpperCase()}</td>
                    <td>
                      <div style={{ fontWeight: '600' }}>{booking.vehicleId?.name || 'N/A'}</div>
                      <div style={{ fontSize: '12px', color: '#555' }}>{booking.vehicleId?.brand || ''}</div>
                    </td>
                    <td>{formatDate(booking.startDate)}</td>
                    <td>{formatDate(booking.endDate)}</td>
                    <td style={{ fontWeight: '600' }}>₹{booking.totalAmount.toLocaleString('en-IN')}</td>
                    <td>
                      <span className={`status-badge ${statusClass[booking.status] || ''}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-start' }}>
                        {/* Invoice — shown for any non-pending/cancelled booking */}
                        {!['Pending', 'Cancelled', 'Rejected'].includes(booking.status) && (
                          <button
                            className="btn-invoice"
                            onClick={() => setInvoiceTarget(booking)}
                          >
                            🧾 Invoice
                          </button>
                        )}
                        {/* Cancel — pending only */}
                        {booking.status === 'Pending' && (
                          <button
                            className="admin-action-btn reject"
                            onClick={() => handleCancel(booking._id)}
                            style={{ fontSize: '12px', padding: '6px 12px' }}
                          >
                            Cancel
                          </button>
                        )}
                        {/* Review — completed only */}
                        {booking.status === 'Completed' && (
                          reviewed[booking._id] ? (
                            <span className="review-done-badge">✓ Reviewed</span>
                          ) : (
                            <button
                              className="btn-review"
                              onClick={() => setReviewTarget(booking)}
                            >
                              ★ Review
                            </button>
                          )
                        )}
                        {/* Nothing to show */}
                        {['Pending', 'Cancelled', 'Rejected'].includes(booking.status) &&
                          booking.status !== 'Pending' && (
                            <span style={{ color: '#888' }}>—</span>
                          )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Review modal */}
      {reviewTarget && (
        <ReviewModal
          booking={reviewTarget}
          onClose={() => setReviewTarget(null)}
          onSubmitted={() => {
            setReviewed((prev) => ({ ...prev, [reviewTarget._id]: true }));
          }}
        />
      )}

      {/* Invoice modal */}
      {invoiceTarget && (
        <InvoiceModal
          booking={invoiceTarget}
          user={user}
          onClose={() => setInvoiceTarget(null)}
        />
      )}
    </div>
  );
}

export default MyBookings;
