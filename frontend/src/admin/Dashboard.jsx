import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, Car, FolderTree, FileText,
  Users, ArrowLeft, MessageSquare, TrendingUp,
  CheckCircle, Clock, BarChart2, Activity, Tag,
} from 'lucide-react';
import { adminAPI } from '../utils/api';
import './Dashboard.css';

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`;
const fmtDate = (s) =>
  new Date(s).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

// Colour palette for status / category charts
const STATUS_COLORS = {
  Pending:   '#FDB022',
  Approved:  '#22C55E',
  Active:    '#3B82F6',
  Completed: '#6B7280',
  Rejected:  '#EF4444',
  Cancelled: '#D1D5DB',
};
const CAT_COLORS = ['#111', '#374151', '#6B7280', '#9CA3AF', '#D1D5DB', '#F4F1E8'];

// ── Pure-CSS horizontal bar chart ────────────────────────────────────────────
function BarChart({ rows, valueKey, labelFormatter, color = '#111', title }) {
  const max = Math.max(...rows.map((r) => r[valueKey]), 1);
  return (
    <div className="dash-chart-card">
      <h3 className="dash-chart-title">{title}</h3>
      <div className="dash-bar-list">
        {rows.map((row, i) => {
          const pct = Math.round((row[valueKey] / max) * 100);
          return (
            <div key={i} className="dash-bar-row">
              <span className="dash-bar-label">{row.label}</span>
              <div className="dash-bar-track">
                <div
                  className="dash-bar-fill"
                  style={{ width: `${pct}%`, backgroundColor: color }}
                />
              </div>
              <span className="dash-bar-value">
                {labelFormatter ? labelFormatter(row[valueKey]) : row[valueKey]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Donut-style distribution chart (pure CSS + SVG-free) ─────────────────────
function SegmentChart({ rows, valueKey, labelKey, colors, title }) {
  const total = rows.reduce((s, r) => s + r[valueKey], 0) || 1;
  return (
    <div className="dash-chart-card">
      <h3 className="dash-chart-title">{title}</h3>
      {/* Stacked progress bar */}
      <div className="dash-segment-bar">
        {rows.map((row, i) => (
          <div
            key={i}
            className="dash-segment-piece"
            style={{
              width: `${(row[valueKey] / total) * 100}%`,
              backgroundColor: colors[i % colors.length],
            }}
            title={`${row[labelKey]}: ${row[valueKey]}`}
          />
        ))}
      </div>
      {/* Legend */}
      <ul className="dash-segment-legend">
        {rows.map((row, i) => (
          <li key={i} className="dash-legend-item">
            <span
              className="dash-legend-dot"
              style={{ backgroundColor: colors[i % colors.length] }}
            />
            <span className="dash-legend-label">{row[labelKey]}</span>
            <span className="dash-legend-count">{row[valueKey]}</span>
            <span className="dash-legend-pct">
              ({Math.round((row[valueKey] / total) * 100)}%)
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, value, label, accent }) {
  return (
    <div className="stat-card" style={{ borderTop: `4px solid ${accent}` }}>
      <Icon className="stat-icon" size={28} style={{ color: accent }} />
      <div className="stat-number">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, reqRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getAllRequests(),
      ]);
      setStats(statsRes.data);
      setRecentRequests(reqRes.data.slice(0, 10));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleStatus = async (id, status) => {
    try {
      await adminAPI.updateRequestStatus(id, status);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${status.toLowerCase()} request`);
    }
  };

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

  // Prepare chart rows
  const bookingRows  = (stats?.bookingsByMonth  || []).map((r) => ({ label: r.label, count: r.count }));
  const revenueRows  = (stats?.revenueByMonth   || []).map((r) => ({ label: r.label, amount: r.amount }));
  const statusRows   = (stats?.bookingsByStatus || [])
    .sort((a, b) => b.count - a.count)
    .map((r) => ({ status: r.status, count: r.count }));
  const categoryRows = (stats?.vehiclesByCategory || [])
    .map((r) => ({ category: r.category, count: r.count }));

  const statusColors = statusRows.map((r) => STATUS_COLORS[r.status] || '#9CA3AF');

  return (
    <div className="admin-page">
      <Sidebar />

      <div className="admin-content">
        <div className="dash-topbar">
          <div>
            <h1>Dashboard</h1>
            <p className="admin-subtitle">Overview of your rental management system</p>
          </div>
          <button className="dash-refresh-btn" onClick={fetchData} title="Refresh">
            ↻ Refresh
          </button>
        </div>

        {error && <div className="dash-error">{error}</div>}

        {/* ── 6 Stat cards ─────────────────────────────────────────── */}
        <div className="admin-stats dash-stats-6">
          <StatCard icon={Users}      value={stats?.totalUsers       ?? 0}       label="Total Users"        accent="#3B82F6" />
          <StatCard icon={Car}        value={stats?.totalVehicles    ?? 0}       label="Total Vehicles"     accent="#111" />
          <StatCard icon={CheckCircle} value={stats?.availableVehicles ?? 0}     label="Available Vehicles" accent="#22C55E" />
          <StatCard icon={FileText}   value={stats?.totalBookings    ?? 0}       label="Total Bookings"     accent="#6B7280" />
          <StatCard icon={Clock}      value={stats?.pendingBookings  ?? 0}       label="Pending Bookings"   accent="#FDB022" />
          <StatCard
            icon={TrendingUp}
            value={fmt(stats?.totalRevenue ?? 0)}
            label="Total Revenue"
            accent="#8B5CF6"
          />
        </div>

        {/* ── Charts row 1: Monthly Bookings + Revenue ──────────────── */}
        <div className="dash-charts-row">
          <BarChart
            title="Bookings per Month"
            rows={bookingRows}
            valueKey="count"
            color="#111"
          />
          <BarChart
            title="Revenue per Month"
            rows={revenueRows}
            valueKey="amount"
            labelFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
            color="#8B5CF6"
          />
        </div>

        {/* ── Charts row 2: Status + Category ──────────────────────── */}
        <div className="dash-charts-row">
          <SegmentChart
            title="Booking Status"
            rows={statusRows}
            valueKey="count"
            labelKey="status"
            colors={statusColors}
          />
          <SegmentChart
            title="Vehicle Categories"
            rows={categoryRows}
            valueKey="count"
            labelKey="category"
            colors={CAT_COLORS}
          />
        </div>

        {/* ── Recent requests table ─────────────────────────────────── */}
        <div className="admin-table-section">
          <div className="dash-section-header">
            <h2>Recent Rental Requests</h2>
            <Link to="/admin/bookings" className="dash-see-all">See all →</Link>
          </div>

          {recentRequests.length === 0 ? (
            <p style={{ color: '#888', padding: '20px 0' }}>No rental requests yet.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Vehicle</th>
                  <th>Start</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentRequests.map((req) => (
                  <tr key={req._id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                      {req._id.slice(-6).toUpperCase()}
                    </td>
                    <td>{req.userId?.name || '—'}</td>
                    <td>{req.vehicleId?.name || '—'}</td>
                    <td>{fmtDate(req.startDate)}</td>
                    <td style={{ fontWeight: 600 }}>{fmt(req.totalAmount)}</td>
                    <td>
                      <span
                        className="status-badge"
                        style={{
                          backgroundColor: STATUS_COLORS[req.status] || '#ccc',
                          color: ['Cancelled', 'Completed', 'Rejected'].includes(req.status) ? '#fff' : '#111',
                        }}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td>
                      {req.status === 'Pending' ? (
                        <>
                          <button
                            className="admin-action-btn approve"
                            onClick={() => handleStatus(req._id, 'Approved')}
                          >
                            Approve
                          </button>
                          <button
                            className="admin-action-btn reject"
                            onClick={() => handleStatus(req._id, 'Rejected')}
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <span style={{ color: '#aaa' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Sidebar extracted so loading state can reuse it ───────────────────────────
function Sidebar() {
  return (
    <aside className="admin-sidebar">
      <h3>ADMIN PANEL</h3>
      <ul>
        {[
          { to: '/admin',            Icon: LayoutDashboard, label: 'Dashboard',  active: true },
          { to: '/admin/vehicles',   Icon: Car,             label: 'Vehicles' },
          { to: '/admin/categories', Icon: FolderTree,      label: 'Categories' },
          { to: '/admin/bookings',   Icon: FileText,        label: 'Bookings' },
          { to: '/admin/revenue',    Icon: TrendingUp,      label: 'Revenue' },
          { to: '/admin/coupons',    Icon: Tag,             label: 'Coupons' },
          { to: '/admin/users',      Icon: Users,           label: 'Users' },
          { to: '/admin/contacts',   Icon: MessageSquare,   label: 'Contacts' },
          { to: '/admin/activity',   Icon: Activity,        label: 'Activity Log' },
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

export default AdminDashboard;
