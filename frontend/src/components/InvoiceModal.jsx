import './InvoiceModal.css';

/**
 * InvoiceModal
 *
 * Props:
 *   booking  — full booking object (with vehicleId and userId populated)
 *   user     — current user object (from AuthContext)
 *   onClose  — () => void
 */
function InvoiceModal({ booking, user, onClose }) {
  if (!booking) return null;

  // ── Calculations ─────────────────────────────────────────────────────────
  const startDate  = new Date(booking.startDate);
  const endDate    = new Date(booking.endDate);
  const days       = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
  const pricePerDay = booking.vehicleId?.pricePerDay
    ?? (days > 0 ? Math.round(booking.totalAmount / days) : booking.totalAmount);
  const subtotal   = booking.totalAmount;
  const tax        = 0;   // no tax in this system — show 0 or adjust as needed
  const total      = subtotal + tax;

  // ── Invoice number: last 8 chars of _id uppercased ────────────────────────
  const invoiceNo  = `INV-${booking._id.slice(-8).toUpperCase()}`;
  const issuedDate = new Date(booking.createdAt || new Date()).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`;
  const fmtDate = (d) =>
    new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  const STATUS_STYLE = {
    Pending:   { bg: '#FEF3C7', color: '#92400E' },
    Approved:  { bg: '#D1FAE5', color: '#065F46' },
    Active:    { bg: '#DBEAFE', color: '#1E40AF' },
    Completed: { bg: '#F0FDF4', color: '#166534' },
    Rejected:  { bg: '#FEE2E2', color: '#991B1B' },
    Cancelled: { bg: '#F3F4F6', color: '#6B7280' },
  };
  const ss = STATUS_STYLE[booking.status] || { bg: '#F3F4F6', color: '#374151' };

  const handlePrint = () => window.print();

  return (
    <div className="inv-overlay" onClick={onClose}>
      <div className="inv-modal" onClick={(e) => e.stopPropagation()}>

        {/* ── Modal toolbar (hidden on print) ───────────────────── */}
        <div className="inv-toolbar no-print">
          <span className="inv-toolbar-title">Booking Receipt</span>
          <div className="inv-toolbar-actions">
            <button className="inv-btn-print" onClick={handlePrint}>
              🖨️ Print / Save PDF
            </button>
            <button className="inv-btn-close" onClick={onClose} aria-label="Close">✕</button>
          </div>
        </div>

        {/* ── Printable invoice area ─────────────────────────────── */}
        <div className="inv-document" id="invoice-print-area">

          {/* Header */}
          <div className="inv-header">
            <div className="inv-brand">
              <div className="inv-brand-name">RENTALHUB</div>
              <div className="inv-brand-tagline">Vehicle Rental Services</div>
            </div>
            <div className="inv-meta">
              <div className="inv-invoice-no">{invoiceNo}</div>
              <div className="inv-issued">Issued: {issuedDate}</div>
              <span
                className="inv-status-badge"
                style={{ background: ss.bg, color: ss.color }}
              >
                {booking.status}
              </span>
            </div>
          </div>

          <div className="inv-divider" />

          {/* Bill To + Vehicle */}
          <div className="inv-parties">
            <div className="inv-party">
              <h4 className="inv-party-label">BILL TO</h4>
              <p className="inv-party-name">{user?.name || booking.userId?.name || '—'}</p>
              <p className="inv-party-detail">{user?.email || booking.userId?.email || '—'}</p>
              {(user?.phone || booking.userId?.phone) && (
                <p className="inv-party-detail">{user?.phone || booking.userId?.phone}</p>
              )}
            </div>

            <div className="inv-party inv-party-right">
              <h4 className="inv-party-label">VEHICLE</h4>
              <p className="inv-party-name">
                {booking.vehicleId?.brand} {booking.vehicleId?.name}
              </p>
              {booking.vehicleId?.category?.name && (
                <p className="inv-party-detail">{booking.vehicleId.category.name}</p>
              )}
              {booking.vehicleId?.location && (
                <p className="inv-party-detail">📍 {booking.vehicleId.location}</p>
              )}
            </div>
          </div>

          {/* Rental period summary */}
          <div className="inv-period-bar">
            <div className="inv-period-item">
              <span className="inv-period-label">Pickup Date</span>
              <span className="inv-period-value">{fmtDate(booking.startDate)}</span>
            </div>
            <div className="inv-period-arrow">→</div>
            <div className="inv-period-item">
              <span className="inv-period-label">Return Date</span>
              <span className="inv-period-value">{fmtDate(booking.endDate)}</span>
            </div>
            <div className="inv-period-divider" />
            <div className="inv-period-item">
              <span className="inv-period-label">Duration</span>
              <span className="inv-period-value inv-period-days">{days} day{days !== 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* Line-items table */}
          <table className="inv-table">
            <thead>
              <tr>
                <th>Description</th>
                <th className="inv-col-qty">Qty</th>
                <th className="inv-col-rate">Rate</th>
                <th className="inv-col-amount">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div className="inv-item-name">
                    {booking.vehicleId?.brand} {booking.vehicleId?.name} — Rental
                  </div>
                  <div className="inv-item-sub">
                    {fmtDate(booking.startDate)} → {fmtDate(booking.endDate)}
                  </div>
                </td>
                <td className="inv-col-qty">{days} day{days !== 1 ? 's' : ''}</td>
                <td className="inv-col-rate">{fmt(pricePerDay)}/day</td>
                <td className="inv-col-amount">{fmt(subtotal)}</td>
              </tr>

              {booking.pickupLocation && (
                <tr className="inv-row-detail">
                  <td colSpan={4}>
                    <span className="inv-detail-label">Pickup location:</span> {booking.pickupLocation}
                  </td>
                </tr>
              )}
              {booking.returnLocation && (
                <tr className="inv-row-detail">
                  <td colSpan={4}>
                    <span className="inv-detail-label">Return location:</span> {booking.returnLocation}
                  </td>
                </tr>
              )}
              {booking.additionalNotes && (
                <tr className="inv-row-detail">
                  <td colSpan={4}>
                    <span className="inv-detail-label">Notes:</span> {booking.additionalNotes}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Totals */}
          <div className="inv-totals">
            <div className="inv-total-row">
              <span>Subtotal</span>
              <span>{fmt(subtotal)}</span>
            </div>
            <div className="inv-total-row">
              <span>Tax / GST</span>
              <span>{fmt(tax)}</span>
            </div>
            <div className="inv-total-row inv-total-final">
              <span>Total</span>
              <span>{fmt(total)}</span>
            </div>
          </div>

          {/* Footer note */}
          <div className="inv-footer">
            <p>Thank you for choosing RentalHub. For any queries, contact us at support@rentalhub.com</p>
            <p className="inv-footer-ref">Booking reference: {booking._id}</p>
          </div>

        </div>{/* /inv-document */}
      </div>
    </div>
  );
}

export default InvoiceModal;
