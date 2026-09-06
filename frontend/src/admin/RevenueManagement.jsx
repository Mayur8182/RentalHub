import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, Car, FolderTree, FileText,
  Users, ArrowLeft, MessageSquare, TrendingUp,
  DollarSign, CheckCircle, Clock,
} from 'lucide-react';
import { adminAPI } from '../utils/api';
import './Dashboard.css';
import './RevenueManagement.css';

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

const fmtDate = (s) =>
  new Date(s).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

const STATUS_COLORS = {
  Pending:   { bg: '#FEF3C7', color: '#92400E' },
  Approved:  { bg: '#D1FAE5', color: '#065F46' },
  Active:    { bg: '#DBEAFE', color: '#1E40AF' },
  Completed: { bg: '#F3F4F6', color: '#374151' },
  Rejected:  { bg: '#FEE2E2', color: '#991B1B' },
  Cancelled: { bg: '#F3F4F6', color: '#6B7280' },
};

const STATUSES = ['All', 'Pending', 'Approved', 'Active', 'Completed', 'Rejected', 'Cancelled'];

function RevenueManagement() {
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [filterStatus, setFilter] = useState('All');
  const [search, setSearch]       = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDir, setSortDir]     = useState('desc');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await adminAPI.getRevenue();
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load revenue data');
    } finally {
      setLoading(false);
    }
  };

  // ── Derived list ─────────────────────────────────────────────────────────
  const filtered = (data?.bookings || [])
    .filter((b) => filterStatus === 'All' || b.status === filterStatus)
    .filter((b) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        b.userId?.name?.toLowerCase().includes(q) ||
        b.vehicleId?.name?.toLowerCase().includes(q) ||
        b.vehicleId?.brand?.toLowerCase().includes(q) ||
        b._id.slice(-6).toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      let av = a[sortField], bv = b[sortField];
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const sortIcon = (field) => {
    if (sortField !== field) return <span className="rev-sort-icon">↕</span>;
    return <span className="rev-sort-icon active">{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  // Filtered revenue total
  const filteredRevenue = filtered
    .filter((b) => ['Approved', 'Completed', 'Active', 'Pending'].includes(b.status))
    .reduce((s, b) => s + b.totalAmount, 0);

  if (loading) {
    return (
      <div className="admin-page">
        <Sidebar />
        <div className="admin-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="dash-spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <Sidebar />

      <div className="admin-content">
        <h1>Revenue Management</h1>
        <p className="admin-subtitle">Track earnings and booking performance</p>

        {error && <div className="dash-error">{error}</div>}

        {/* ── 3 Revenue stat cards ─────────────────────────────────── */}
        <div className="rev-stat-row">
          <div className="rev-stat-card rev-stat-total">
            <div className="rev-stat-icon-wrap">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="rev-stat-label">Total Revenue</p>
              <p className="rev-stat-value">{fmt(data?.totalRevenue ?? 0)}</p>
              <p className="rev-stat-sub">{(data?.bookings || []).filter(b => ['Approved','Completed','Active','Pending'].includes(b.status)).length} active bookings</p>
            </div>
          </div>

          <div className="rev-stat-card rev-stat-completed">
            <div className="rev-stat-icon-wrap">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="rev-stat-label">Confirmed Revenue</p>
              <p className="rev-stat-value">{fmt(data?.completedRevenue ?? 0)}</p>
              <p className="rev-stat-sub">Approved + Active + Completed</p>
            </div>
          </div>

          <div className="rev-stat-card rev-stat-pending">
            <div className="rev-stat-icon-wrap">
              <Clock size={24} />
            </div>
            <div>
              <p className="rev-stat-label">Pending Revenue</p>
              <p className="rev-stat-value">{fmt(data?.pendingRevenue ?? 0)}</p>
              <p className="rev-stat-sub">Awaiting approval</p>
            </div>
          </div>
        </div>

        {/* ── Controls ─────────────────────────────────────────────── */}
        <div className="rev-controls">
          {/* Search */}
          <input
            type="text"
            className="rev-search"
            placeholder="Search by user, vehicle, or booking ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* Status filter chips */}
          <div className="rev-filter-chips">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`rev-chip ${filterStatus === s ? 'rev-chip--active' : ''}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* ── Table ────────────────────────────────────────────────── */}
        <div className="admin-table-section">
          <div className="dash-section-header">
            <h2>
              Bookings
              <span className="rev-table-count">{filtered.length}</span>
            </h2>
            {search || filterStatus !== 'All' ? (
              <span className="rev-filtered-revenue">
                Filtered total: <strong>{fmt(filteredRevenue)}</strong>
              </span>
            ) : null}
          </div>

          {filtered.length === 0 ? (
            <p style={{ color: '#888', padding: '20px 0' }}>No bookings match the current filter.</p>
          ) : (
            <div className="rev-table-wrap">
              <table className="admin-table rev-table">
                <thead>
                  <tr>
                    <th onClick={() => toggleSort('_id')} className="rev-th-sort">
                      Booking ID {sortIcon('_id')}
                    </th>
                    <th onClick={() => toggleSort('userId')} className="rev-th-sort">
                      User {sortIcon('userId')}
                    </th>
                    <th onClick={() => toggleSort('vehicleId')} className="rev-th-sort">
                      Vehicle {sortIcon('vehicleId')}
                    </th>
                    <th onClick={() => toggleSort('days')} className="rev-th-sort">
                      Days {sortIcon('days')}
                    </th>
                    <th onClick={() => toggleSort('totalAmount')} className="rev-th-sort">
                      Amount {sortIcon('totalAmount')}
                    </th>
                    <th onClick={() => toggleSort('status')} className="rev-th-sort">
                      Status {sortIcon('status')}
                    </th>
                    <th onClick={() => toggleSort('createdAt')} className="rev-th-sort">
                      Date {sortIcon('createdAt')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((b) => {
                    const sc = STATUS_COLORS[b.status] || { bg: '#F3F4F6', color: '#374151' };
                    return (
                      <tr key={b._id}>
                        <td>
                          <span className="rev-booking-id">
                            #{b._id.slice(-6).toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <div className="rev-user-cell">
                            <span className="rev-user-avatar">
                              {(b.userId?.name || '?').charAt(0).toUpperCase()}
                            </span>
                            <div>
                              <div className="rev-user-name">{b.userId?.name || '—'}</div>
                              <div className="rev-user-email">{b.userId?.email || ''}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="rev-vehicle-name">{b.vehicleId?.name || '—'}</div>
                          <div className="rev-vehicle-brand">{b.vehicleId?.brand || ''}</div>
                        </td>
                        <td>
                          <span className="rev-days-badge">{b.days}d</span>
                        </td>
                        <td>
                          <span className="rev-amount">{fmt(b.totalAmount)}</span>
                        </td>
                        <td>
                          <span
                            className="status-badge"
                            style={{ backgroundColor: sc.bg, color: sc.color }}
                          >
                            {b.status}
                          </span>
                        </td>
                        <td className="rev-date">{fmtDate(b.createdAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Table footer summary */}
          {filtered.length > 0 && (
            <div className="rev-table-footer">
              <span>{filtered.length} booking{filtered.length !== 1 ? 's' : ''}</span>
              <span>
                Showing total: <strong>{fmt(filteredRevenue)}</strong>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar() {
  return (
    <aside className="admin-sidebar">
      <h3>ADMIN PANEL</h3>
      <ul>
        {[
          { to: '/admin',            Icon: LayoutDashboard, label: 'Dashboard' },
          { to: '/admin/vehicles',   Icon: Car,             label: 'Vehicles' },
          { to: '/admin/categories', Icon: FolderTree,      label: 'Categories' },
          { to: '/admin/bookings',   Icon: FileText,        label: 'Bookings' },
          { to: '/admin/revenue',    Icon: TrendingUp,      label: 'Revenue',    active: true },
          { to: '/admin/users',      Icon: Users,           label: 'Users' },
          { to: '/admin/contacts',   Icon: MessageSquare,   label: 'Contacts' },
          { to: '/',                 Icon: ArrowLeft,        label: 'Back to Site' },
        ].map(({ to, Icon, label, active }) => (
          <li key={to} className={active ? 'active' : ''}>
            <Link to={to}>
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default RevenueManagement;
