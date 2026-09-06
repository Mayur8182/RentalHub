import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, Car, FolderTree, FileText,
  Users, ArrowLeft, MessageSquare, TrendingUp,
  Activity, RefreshCw,
} from 'lucide-react';
import { adminAPI } from '../utils/api';
import './Dashboard.css';
import './ActivityLog.css';

const CATEGORIES = ['all', 'auth', 'booking', 'vehicle', 'user', 'contact', 'system'];

const CAT_META = {
  auth:    { icon: '🔐', label: 'Auth',    color: '#3B82F6' },
  booking: { icon: '📋', label: 'Booking', color: '#8B5CF6' },
  vehicle: { icon: '🚗', label: 'Vehicle', color: '#F59E0B' },
  user:    { icon: '👤', label: 'User',    color: '#10B981' },
  contact: { icon: '✉️', label: 'Contact', color: '#EC4899' },
  system:  { icon: '⚙️', label: 'System',  color: '#6B7280' },
};

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60)    return `${Math.floor(diff)}s ago`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function ActivityLogPage() {
  const [logs,     setLogs]     = useState([]);
  const [total,    setTotal]    = useState(0);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [category, setCategory] = useState('all');
  const [search,   setSearch]   = useState('');
  const [page,     setPage]     = useState(1);
  const LIMIT = 50;

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await adminAPI.getActivityLogs({ category, page, limit: LIMIT });
      setLogs(res.data.logs);
      setTotal(res.data.total);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  }, [category, page]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);
  useEffect(() => { setPage(1); }, [category]);

  const filtered = search.trim()
    ? logs.filter(l =>
        l.action.toLowerCase().includes(search.toLowerCase()) ||
        l.performedByName?.toLowerCase().includes(search.toLowerCase())
      )
    : logs;

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="admin-page">
      <Sidebar />
      <div className="admin-content">
        {/* Header */}
        <div className="dash-topbar">
          <div>
            <h1>Activity Log</h1>
            <p className="admin-subtitle">
              System-wide audit trail · {total.toLocaleString()} entries
            </p>
          </div>
          <button className="dash-refresh-btn" onClick={fetchLogs} disabled={loading}>
            <RefreshCw size={14} style={{ marginRight: 4 }} />
            Refresh
          </button>
        </div>

        {error && <div className="dash-error">{error}</div>}

        {/* Controls */}
        <div className="al-controls">
          <input
            type="text"
            className="al-search"
            placeholder="Search actions or users…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="al-cat-chips">
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`al-chip ${category === c ? 'al-chip--active' : ''}`}
                style={category === c && c !== 'all' ? { borderColor: CAT_META[c]?.color, color: CAT_META[c]?.color } : {}}
              >
                {c === 'all' ? '🗂 All' : `${CAT_META[c]?.icon} ${CAT_META[c]?.label}`}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <div className="dash-spinner" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="al-empty">
            <div className="al-empty-icon">📭</div>
            <p>{search ? `No logs matching "${search}"` : 'No activity logs yet'}</p>
            <span>Actions like logins, bookings and vehicle changes will appear here.</span>
          </div>
        ) : (
          <div className="al-timeline">
            {filtered.map((log, i) => {
              const meta = CAT_META[log.category] || CAT_META.system;
              return (
                <div key={log._id || i} className="al-entry">
                  {/* Left: dot + line */}
                  <div className="al-dot-col">
                    <div className="al-dot" style={{ background: meta.color }}>
                      <span>{meta.icon}</span>
                    </div>
                    {i < filtered.length - 1 && <div className="al-line" />}
                  </div>

                  {/* Right: content */}
                  <div className="al-content">
                    <div className="al-content-header">
                      <span className="al-action">{log.action}</span>
                      <span className="al-time" title={new Date(log.createdAt).toLocaleString()}>
                        {timeAgo(log.createdAt)}
                      </span>
                    </div>

                    <div className="al-meta-row">
                      <span
                        className="al-cat-badge"
                        style={{ background: meta.color + '18', color: meta.color }}
                      >
                        {meta.label}
                      </span>
                      <span className="al-by">
                        by <strong>{log.performedByName || 'System'}</strong>
                      </span>
                      {log.ip && (
                        <span className="al-ip">{log.ip}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && !search && (
          <div className="al-pagination">
            <button
              className="al-page-btn"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              ← Prev
            </button>
            <span className="al-page-info">
              Page {page} of {totalPages}
            </span>
            <button
              className="al-page-btn"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next →
            </button>
          </div>
        )}
      </div>
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
          { to: '/admin/bookings',   Icon: FileText,        label: 'Bookings' },
          { to: '/admin/revenue',    Icon: TrendingUp,      label: 'Revenue' },
          { to: '/admin/users',      Icon: Users,           label: 'Users' },
          { to: '/admin/contacts',   Icon: MessageSquare,   label: 'Contacts' },
          { to: '/admin/activity',   Icon: Activity,        label: 'Activity Log', active: true },
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

export default ActivityLogPage;
