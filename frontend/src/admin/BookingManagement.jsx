import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, Car, FolderTree, FileText,
  Users, ArrowLeft, MessageSquare, TrendingUp,
  Activity, Download, ChevronDown, ChevronUp,
} from 'lucide-react';
import { adminAPI } from '../utils/api';
import InvoiceModal from '../components/InvoiceModal';
import './Dashboard.css';

const STATUSES = ['All', 'Pending', 'Approved', 'Active', 'Completed', 'Rejected', 'Cancelled'];

const STATUS_COLORS = {
  Pending:   '#FDB022', Approved: '#22C55E', Active: '#3B82F6',
  Completed: '#6B7280', Rejected: '#EF4444', Cancelled: '#D1D5DB',
};

const fmtDate = (s) =>
  new Date(s).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const fmtCurrency = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

function exportCSV(bookings) {
  const headers = ['ID', 'User', 'Email', 'Vehicle', 'Brand', 'Start Date', 'End Date', 'Days', 'Amount', 'Status', 'Created'];
  const rows = bookings.map(b => {
    const days = Math.max(1, Math.ceil((new Date(b.endDate) - new Date(b.startDate)) / 86400000));
    return [
      b._id.slice(-6).toUpperCase(),
      b.userId?.name || '',
      b.userId?.email || '',
      b.vehicleId?.name || '',
      b.vehicleId?.brand || '',
      fmtDate(b.startDate),
      fmtDate(b.endDate),
      days,
      b.totalAmount,
      b.status,
      fmtDate(b.createdAt),
    ];
  });
  const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `bookings-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function BookingManagement() {
  const [bookings,         setBookings]         = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [filterStatus,     setFilterStatus]     = useState('All');
  const [search,           setSearch]           = useState('');
  const [expandedRow,      setExpandedRow]      = useState(null);
  const [invoiceTarget,    setInvoiceTarget]    = useState(null);

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getAllRequests();
      setBookings(res.data);
    } catch { alert('Failed to fetch bookings'); }
    finally { setLoading(false); }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await adminAPI.updateRequestStatus(id, status);
      fetchBookings();
    } catch (err) { alert(err.response?.data?.message || 'Failed to update status'); }
  };

  const handlePickupStatus = async (id, field, value) => {
    try {
      await adminAPI.updatePickupStatus(id, { [field]: value });
      fetchBookings();
    } catch (err) { alert(err.response?.data?.message || 'Failed to update pickup status'); }
  };

  const nextActions = (status) => {
    const map = {
      Pending:  [{ status: 'Approved', label: 'Approve', cls: 'approve' }, { status: 'Rejected', label: 'Reject', cls: 'reject' }],
      Approved: [{ status: 'Active',    label: 'Start',   cls: 'edit'    }, { status: 'Cancelled', label: 'Cancel', cls: 'delete' }],
      Active:   [{ status: 'Completed', label: 'Complete', cls: 'edit'   }],
    };
    return map[status] || [];
  };

  // Filter
  const filtered = bookings
    .filter(b => filterStatus === 'All' || b.status === filterStatus)
    .filter(b => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        b._id.slice(-6).toLowerCase().includes(q) ||
        b.userId?.name?.toLowerCase().includes(q) ||
        b.userId?.email?.toLowerCase().includes(q) ||
        b.vehicleId?.name?.toLowerCase().includes(q)
      );
    });

  // Stats
  const stats = STATUSES.slice(1).reduce((acc, s) => {
    acc[s] = bookings.filter(b => b.status === s).length;
    return acc;
  }, {});

  return (
    <div className="admin-page">
      <Sidebar />
      <div className="admin-content">
        <div className="dash-topbar">
          <div>
            <h1>Booking Management</h1>
            <p className="admin-subtitle">Manage rental requests · {bookings.length} total</p>
          </div>
          <button
            className="dash-refresh-btn"
            onClick={() => exportCSV(filtered)}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Download size={14} /> Export CSV
          </button>
        </div>

        {/* Mini stat chips */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
          {STATUSES.slice(1).map(s => (
            <div key={s} style={{
              background: '#fff', border: `1px solid #E8E8E8`, borderRadius: 6,
              padding: '8px 14px', fontSize: 13, fontWeight: 600, display: 'flex', gap: 6, alignItems: 'center'
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLORS[s], display: 'inline-block' }} />
              {s}: <span style={{ color: '#111' }}>{stats[s]}</span>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20, alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search by ID, user, or vehicle…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ padding: '9px 14px', border: '1px solid #E8E8E8', borderRadius: 6, fontSize: 14, width: 300, fontFamily: 'inherit', outline: 'none' }}
          />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {STATUSES.map(s => (
              <button key={s} onClick={() => setFilterStatus(s)} style={{
                padding: '7px 14px',
                border: filterStatus === s ? '2px solid #111' : '1px solid #E8E8E8',
                background: filterStatus === s ? '#111' : '#FFF',
                color: filterStatus === s ? '#FFF' : '#111',
                cursor: 'pointer', borderRadius: 4, fontSize: 13, fontWeight: 600,
              }}>{s}</button>
            ))}
          </div>
        </div>

        <div className="admin-table-section">
          <div className="dash-section-header">
            <h2>Bookings <span style={{ fontSize: 13, color: '#888', fontWeight: 500 }}>({filtered.length})</span></h2>
          </div>
          {loading ? <p>Loading…</p> : filtered.length === 0 ? (
            <p style={{ color: '#888', padding: '20px 0' }}>No bookings match the current filter.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: 28 }}></th>
                  <th>ID</th><th>User</th><th>Vehicle</th>
                  <th>Start</th><th>End</th><th>Days</th>
                  <th>Amount</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(b => {
                  const days = Math.max(1, Math.ceil((new Date(b.endDate) - new Date(b.startDate)) / 86400000));
                  const isExpanded = expandedRow === b._id;
                  const actions = nextActions(b.status);
                  return [
                    <tr key={b._id} style={{ cursor: 'pointer' }}>
                      <td onClick={() => setExpandedRow(isExpanded ? null : b._id)}>
                        {isExpanded
                          ? <ChevronUp size={14} style={{ color: '#888' }} />
                          : <ChevronDown size={14} style={{ color: '#888' }} />}
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700 }}>
                        #{b._id.slice(-6).toUpperCase()}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{b.userId?.name || '—'}</div>
                        <div style={{ fontSize: 12, color: '#9CA3AF' }}>{b.userId?.email || ''}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{b.vehicleId?.name || '—'}</div>
                        <div style={{ fontSize: 12, color: '#9CA3AF' }}>{b.vehicleId?.brand || ''}</div>
                      </td>
                      <td>{fmtDate(b.startDate)}</td>
                      <td>{fmtDate(b.endDate)}</td>
                      <td>
                        <span style={{ background: '#EDE9FE', color: '#6D28D9', borderRadius: 12, padding: '2px 8px', fontSize: 12, fontWeight: 700 }}>
                          {days}d
                        </span>
                      </td>
                      <td style={{ fontWeight: 700 }}>{fmtCurrency(b.totalAmount)}</td>
                      <td>
                        <span style={{
                          display: 'inline-block', padding: '3px 10px', borderRadius: 12,
                          fontSize: 11, fontWeight: 700,
                          background: STATUS_COLORS[b.status] + '22',
                          color: STATUS_COLORS[b.status],
                          border: `1px solid ${STATUS_COLORS[b.status]}44`,
                        }}>{b.status}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {actions.map(a => (
                            <button key={a.status} className={`admin-action-btn ${a.cls}`}
                              onClick={() => handleStatusUpdate(b._id, a.status)}
                              style={{ fontSize: 11, padding: '4px 10px' }}>
                              {a.label}
                            </button>
                          ))}
                          {!['Pending','Cancelled','Rejected'].includes(b.status) && (
                            <button onClick={() => setInvoiceTarget(b)} style={{
                              background: '#EDE9FE', color: '#6D28D9', border: '1px solid #C4B5FD',
                              borderRadius: 4, padding: '4px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer'
                            }}>🧾</button>
                          )}
                        </div>
                      </td>
                    </tr>,

                    /* Expanded detail row */
                    isExpanded && (
                      <tr key={`${b._id}-detail`} style={{ background: '#FAFAF8' }}>
                        <td colSpan={10} style={{ padding: '16px 24px', borderBottom: '2px solid #E8E8E8' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, fontSize: 13 }}>
                            {/* Locations */}
                            <div>
                              <div style={{ color: '#9CA3AF', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', marginBottom: 6 }}>📍 Pickup Location</div>
                              <div style={{ fontWeight: 600, color: '#111' }}>{b.pickupLocation || '—'}</div>
                            </div>
                            <div>
                              <div style={{ color: '#9CA3AF', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', marginBottom: 6 }}>🏁 Return Location</div>
                              <div style={{ fontWeight: 600, color: '#111' }}>{b.returnLocation || b.pickupLocation || '—'}</div>
                            </div>
                            <div>
                              <div style={{ color: '#9CA3AF', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', marginBottom: 6 }}>Notes</div>
                              <div>{b.additionalNotes || '—'}</div>
                            </div>
                          </div>

                          {/* Pickup / Return status tracker */}
                          {['Active', 'Approved', 'Completed'].includes(b.status) && (
                            <div style={{ marginTop: 16, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', paddingTop: 14, borderTop: '1px solid #E8E8E8' }}>
                              <span style={{ fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Vehicle Status:</span>

                              {/* Picked up */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{
                                  padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700,
                                  background: b.vehiclePickedUp ? '#D1FAE5' : '#FEF3C7',
                                  color:      b.vehiclePickedUp ? '#065F46' : '#92400E',
                                }}>
                                  {b.vehiclePickedUp ? '🚗 Picked Up' : '⏳ Awaiting Pickup'}
                                </span>
                                {b.vehiclePickedUp && b.pickedUpAt && (
                                  <span style={{ fontSize: 11, color: '#9CA3AF' }}>{fmtDate(b.pickedUpAt)}</span>
                                )}
                                {!b.vehiclePickedUp && b.status !== 'Completed' && (
                                  <button
                                    onClick={() => handlePickupStatus(b._id, 'vehiclePickedUp', true)}
                                    style={{ padding: '3px 10px', background: '#D1FAE5', color: '#065F46', border: '1px solid #A7F3D0', borderRadius: 4, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                                    ✓ Mark Picked Up
                                  </button>
                                )}
                              </div>

                              {/* Returned */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{
                                  padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700,
                                  background: b.vehicleReturned ? '#D1FAE5' : '#FEE2E2',
                                  color:      b.vehicleReturned ? '#065F46' : '#991B1B',
                                }}>
                                  {b.vehicleReturned ? '✅ Returned' : '🔴 Not Returned'}
                                </span>
                                {b.vehicleReturned && b.returnedAt && (
                                  <span style={{ fontSize: 11, color: '#9CA3AF' }}>{fmtDate(b.returnedAt)}</span>
                                )}
                                {b.vehiclePickedUp && !b.vehicleReturned && b.status !== 'Completed' && (
                                  <button
                                    onClick={() => handlePickupStatus(b._id, 'vehicleReturned', true)}
                                    style={{ padding: '3px 10px', background: '#DBEAFE', color: '#1E40AF', border: '1px solid #BFDBFE', borderRadius: 4, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                                    ✓ Mark Returned
                                  </button>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Full booking ID */}
                          <div style={{ marginTop: 12, fontSize: 11, color: '#9CA3AF', fontFamily: 'monospace' }}>
                            ID: {b._id}
                          </div>
                        </td>
                      </tr>
                    )
                  ];
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {invoiceTarget && (
        <InvoiceModal
          booking={invoiceTarget}
          user={invoiceTarget.userId}
          onClose={() => setInvoiceTarget(null)}
        />
      )}
    </div>
  );
}

function Sidebar() {
  return (
    <aside className="admin-sidebar">
      <h3>ADMIN PANEL</h3>
      <ul>
        {[
          { to: '/admin',            Icon: LayoutDashboard, label: 'Dashboard' },
          { to: '/admin/vehicles',   Icon: Car,             label: 'Vehicles' },
          { to: '/admin/categories', Icon: FolderTree,      label: 'Categories' },
          { to: '/admin/bookings',   Icon: FileText,        label: 'Bookings', active: true },
          { to: '/admin/revenue',    Icon: TrendingUp,      label: 'Revenue' },
          { to: '/admin/users',      Icon: Users,           label: 'Users' },
          { to: '/admin/contacts',   Icon: MessageSquare,   label: 'Contacts' },
          { to: '/admin/activity',   Icon: Activity,        label: 'Activity Log' },
          { to: '/',                 Icon: ArrowLeft,        label: 'Back to Site' },
        ].map(({ to, Icon, label, active }) => (
          <li key={to} className={active ? 'active' : ''}>
            <Link to={to}><Icon size={18} /><span>{label}</span></Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default BookingManagement;
