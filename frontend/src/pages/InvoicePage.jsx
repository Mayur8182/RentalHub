import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { bookingAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './InvoicePage.css';

const fmtDate = (s) => new Date(s).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
const fmt     = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

const STATUS_STYLE = {
  Pending:   { bg: '#FEF3C7', color: '#92400E' },
  Approved:  { bg: '#D1FAE5', color: '#065F46' },
  Active:    { bg: '#DBEAFE', color: '#1E40AF' },
  Completed: { bg: '#F0FDF4', color: '#166534' },
  Rejected:  { bg: '#FEE2E2', color: '#991B1B' },
  Cancelled: { bg: '#F3F4F6', color: '#6B7280' },
};

function InvoicePage() {
  const { id }    = useParams();
  const { user }  = useAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    bookingAPI.getById(id)
      .then(r => setBooking(r.data))
      .catch(e => setError(e.response?.data?.message || 'Booking not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="inv-page-loading">
      <div className="inv-page-spinner" />
      <p>Loading invoice…</p>
    </div>
  );

  if (error || !booking) return (
    <div className="inv-page-error">
      <h2>Invoice Not Found</h2>
      <p>{error}</p>
      <Link to="/my-bookings" className="btn btn-primary">My Bookings</Link>
    </div>
  );

  const days     = Math.max(1, Math.ceil((new Date(booking.endDate) - new Date(booking.startDate)) / 86400000));
  const pricePerDay = booking.vehicleId?.pricePerDay ?? Math.round(booking.totalAmount / days);
  const baseAmt  = days * pricePerDay;
  const weekend  = booking.weekendSurcharge ?? 0;
  const extras   = booking.extrasAmount     ?? 0;
  const discount = booking.discountAmount   ?? 0;
  const tax      = 0;
  const total    = booking.totalAmount;
  const invoiceNo = `INV-${booking._id.slice(-8).toUpperCase()}`;
  const issuedDate = fmtDate(booking.createdAt || new Date());
  const ss = STATUS_STYLE[booking.status] || { bg: '#F3F4F6', color: '#374151' };

  // Selected extras names
  const EXTRA_LABELS = { gps: 'GPS Navigation', childSeat: 'Child Seat', insurance: 'Insurance', additionalDriver: 'Additional Driver' };
  const extrasList = booking.extras
    ? Object.entries(booking.extras).filter(([, v]) => v).map(([k]) => EXTRA_LABELS[k] || k)
    : [];

  return (
    <div className="inv-page">
      {/* Toolbar — hidden when printing */}
      <div className="inv-toolbar no-print">
        <Link to={`/bookings/${id}`} className="inv-back-btn">← Back to Booking</Link>
        <button className="inv-print-btn" onClick={() => window.print()}>
          🖨️ Download / Print PDF
        </button>
      </div>

      {/* ── The printable document ── */}
      <div className="inv-doc" id="invoice-doc">
        {/* Header */}
        <div className="inv-header-row">
          <div>
            <div className="inv-brand">RENTALHUB</div>
            <div className="inv-brand-sub">Vehicle Rental Services</div>
          </div>
          <div className="inv-header-right">
            <div className="inv-number">{invoiceNo}</div>
            <div className="inv-issued">Issued: {issuedDate}</div>
            <span className="inv-status-pill" style={{ background: ss.bg, color: ss.color }}>
              {booking.status}
            </span>
          </div>
        </div>

        <div className="inv-rule" />

        {/* Bill to + Vehicle */}
        <div className="inv-parties">
          <div>
            <div className="inv-party-label">BILL TO</div>
            <div className="inv-party-name">{user?.name || booking.userId?.name || '—'}</div>
            <div className="inv-party-detail">{user?.email || booking.userId?.email || '—'}</div>
            {(user?.phone || booking.userId?.phone) && (
              <div className="inv-party-detail">{user?.phone || booking.userId?.phone}</div>
            )}
          </div>
          <div className="inv-party-right">
            <div className="inv-party-label">VEHICLE</div>
            <div className="inv-party-name">
              {booking.vehicleId?.brand} {booking.vehicleId?.name}
            </div>
            {booking.vehicleId?.location && (
              <div className="inv-party-detail">📍 {booking.vehicleId.location}</div>
            )}
          </div>
        </div>

        {/* Rental period bar */}
        <div className="inv-period-bar">
          <div className="inv-period-item">
            <div className="inv-period-lbl">Pickup Date</div>
            <div className="inv-period-val">{fmtDate(booking.startDate)}</div>
          </div>
          <div className="inv-period-arrow">→</div>
          <div className="inv-period-item">
            <div className="inv-period-lbl">Return Date</div>
            <div className="inv-period-val">{fmtDate(booking.endDate)}</div>
          </div>
          <div className="inv-period-sep" />
          <div className="inv-period-item">
            <div className="inv-period-lbl">Duration</div>
            <div className="inv-period-val inv-period-days">{days} day{days !== 1 ? 's' : ''}</div>
          </div>
        </div>

        {/* Location info */}
        {(booking.pickupLocation || booking.returnLocation) && (
          <div className="inv-locations">
            {booking.pickupLocation  && <div><strong>Pickup:</strong> {booking.pickupLocation}</div>}
            {booking.returnLocation  && <div><strong>Return:</strong> {booking.returnLocation}</div>}
          </div>
        )}

        {/* Line items */}
        <table className="inv-table">
          <thead>
            <tr>
              <th>Description</th>
              <th className="inv-col-c">Qty</th>
              <th className="inv-col-r">Rate</th>
              <th className="inv-col-r">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div className="inv-item-name">{booking.vehicleId?.brand} {booking.vehicleId?.name} — Rental</div>
                <div className="inv-item-sub">{fmtDate(booking.startDate)} → {fmtDate(booking.endDate)}</div>
              </td>
              <td className="inv-col-c">{days}d</td>
              <td className="inv-col-r">{fmt(pricePerDay)}/day</td>
              <td className="inv-col-r">{fmt(baseAmt)}</td>
            </tr>
            {weekend > 0 && (
              <tr>
                <td><div className="inv-item-name">Weekend / Holiday Surcharge</div></td>
                <td className="inv-col-c">—</td>
                <td className="inv-col-r">—</td>
                <td className="inv-col-r">+{fmt(weekend)}</td>
              </tr>
            )}
            {extrasList.map(el => (
              <tr key={el}>
                <td><div className="inv-item-name">{el}</div></td>
                <td className="inv-col-c">{days}d</td>
                <td className="inv-col-r">—</td>
                <td className="inv-col-r">—</td>
              </tr>
            ))}
            {extras > 0 && (
              <tr>
                <td><div className="inv-item-name">Extra Services Total</div></td>
                <td className="inv-col-c">—</td>
                <td className="inv-col-r">—</td>
                <td className="inv-col-r">+{fmt(extras)}</td>
              </tr>
            )}
            {discount > 0 && (
              <tr>
                <td><div className="inv-item-name">Coupon Discount</div></td>
                <td className="inv-col-c">—</td>
                <td className="inv-col-r">—</td>
                <td className="inv-col-r" style={{ color: '#059669' }}>−{fmt(discount)}</td>
              </tr>
            )}
            {booking.additionalNotes && (
              <tr className="inv-row-note">
                <td colSpan={4}><strong>Notes:</strong> {booking.additionalNotes}</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Totals */}
        <div className="inv-totals">
          <div className="inv-total-row"><span>Subtotal</span><span>{fmt(total + discount - tax)}</span></div>
          {discount > 0 && <div className="inv-total-row" style={{ color: '#059669' }}><span>Discount</span><span>−{fmt(discount)}</span></div>}
          <div className="inv-total-row"><span>Tax / GST</span><span>{fmt(tax)}</span></div>
          <div className="inv-total-row inv-total-final"><span>Total</span><span>{fmt(total)}</span></div>
        </div>

        {/* Footer */}
        <div className="inv-footer">
          <p>Thank you for choosing RentalHub. Queries? support@rentalhub.com</p>
          <p className="inv-ref">Ref: {booking._id}</p>
        </div>
      </div>
    </div>
  );
}

export default InvoicePage;
