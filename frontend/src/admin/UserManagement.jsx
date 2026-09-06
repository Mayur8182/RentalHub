import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, Car, FolderTree, FileText,
  Users, ArrowLeft, MessageSquare, TrendingUp,
  Activity, Trash2, Download,
} from 'lucide-react';
import { adminAPI } from '../utils/api';
import './Dashboard.css';

const fmtDate = (s) =>
  new Date(s).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

function exportUsersCSV(users) {
  const headers = ['Name', 'Email', 'Phone', 'Role', 'Bookings', 'Total Spent', 'Registered'];
  const rows = users.map(u => [
    u.name, u.email, u.phone || '', u.role,
    u.bookingCount ?? 0, u.totalSpent ?? 0, fmtDate(u.createdAt),
  ]);
  const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = `users-${new Date().toISOString().slice(0,10)}.csv`; a.click();
  URL.revokeObjectURL(url);
}

function UserManagement() {
  const [users,       setUsers]       = useState([]);
  const [bookings,    setBookings]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [filterRole,  setFilterRole]  = useState('All');
  const [search,      setSearch]      = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, bookingsRes] = await Promise.all([
        adminAPI.getAllUsers(),
        adminAPI.getAllRequests(),
      ]);
      const bkgs = bookingsRes.data;
      setBookings(bkgs);

      // Enrich users with booking stats
      const enriched = usersRes.data.map(u => {
        const userBkgs = bkgs.filter(b => b.userId?._id === u._id || b.userId === u._id);
        const totalSpent = userBkgs
          .filter(b => ['Approved','Completed','Active'].includes(b.status))
          .reduce((s, b) => s + b.totalAmount, 0);
        return { ...u, bookingCount: userBkgs.length, totalSpent };
      });
      setUsers(enriched);
    } catch { alert('Failed to fetch data'); }
    finally { setLoading(false); }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminAPI.updateUserRole(userId, newRole);
      fetchData();
    } catch (err) { alert(err.response?.data?.message || 'Failed to update role'); }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete user "${user.name}"? This cannot be undone.`)) return;
    try {
      await adminAPI.deleteUser(user._id);
      fetchData();
    } catch (err) { alert(err.response?.data?.message || 'Failed to delete user'); }
  };

  const filtered = users
    .filter(u => filterRole === 'All' || u.role === filterRole.toLowerCase())
    .filter(u => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    });

  const adminCount = users.filter(u => u.role === 'admin').length;
  const userCount  = users.filter(u => u.role === 'user').length;

  return (
    <div className="admin-page">
      <Sidebar />
      <div className="admin-content">
        <div className="dash-topbar">
          <div>
            <h1>User Management</h1>
            <p className="admin-subtitle">
              {users.length} total · {adminCount} admin{adminCount !== 1 ? 's' : ''} · {userCount} user{userCount !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            className="dash-refresh-btn"
            onClick={() => exportUsersCSV(filtered)}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Download size={14} /> Export CSV
          </button>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24, alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ padding: '9px 14px', border: '1px solid #E8E8E8', borderRadius: 6, fontSize: 14, width: 280, fontFamily: 'inherit', outline: 'none' }}
          />
          {['All', 'Admin', 'User'].map(r => (
            <button key={r} onClick={() => setFilterRole(r)} style={{
              padding: '8px 16px',
              border: filterRole === r ? '2px solid #111' : '1px solid #E8E8E8',
              background: filterRole === r ? '#111' : '#FFF',
              color: filterRole === r ? '#FFF' : '#111',
              cursor: 'pointer', borderRadius: 4, fontSize: 13, fontWeight: 600,
            }}>{r}</button>
          ))}
        </div>

        <div className="admin-table-section">
          <div className="dash-section-header">
            <h2>Users <span style={{ fontSize: 13, color: '#888', fontWeight: 500 }}>({filtered.length})</span></h2>
          </div>
          {loading ? <p>Loading…</p> : filtered.length === 0 ? (
            <p style={{ color: '#888', padding: '20px 0' }}>No users found.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Bookings</th>
                  <th>Total Spent</th>
                  <th>Registered</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(user => (
                  <tr key={user._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: user.role === 'admin' ? '#111' : '#E8E8E8',
                          color: user.role === 'admin' ? '#fff' : '#374151',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 14, fontWeight: 700, flexShrink: 0,
                        }}>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{user.name}</div>
                          <div style={{ fontSize: 12, color: '#9CA3AF' }}>{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 13, color: '#6B7280' }}>{user.phone || '—'}</td>
                    <td>
                      <span style={{
                        display: 'inline-block', padding: '3px 10px', borderRadius: 12,
                        fontSize: 11, fontWeight: 700,
                        background: user.role === 'admin' ? '#111' : '#F3F4F6',
                        color: user.role === 'admin' ? '#fff' : '#374151',
                      }}>
                        {user.role.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        fontWeight: 700, color: user.bookingCount > 0 ? '#8B5CF6' : '#9CA3AF'
                      }}>
                        {user.bookingCount}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: user.totalSpent > 0 ? '#111' : '#9CA3AF' }}>
                        {user.totalSpent > 0 ? `₹${user.totalSpent.toLocaleString('en-IN')}` : '—'}
                      </span>
                    </td>
                    <td style={{ fontSize: 13, color: '#6B7280' }}>{fmtDate(user.createdAt)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <select
                          value={user.role}
                          onChange={e => handleRoleChange(user._id, e.target.value)}
                          style={{
                            padding: '5px 10px', border: '1px solid #E8E8E8',
                            borderRadius: 4, fontSize: 13, fontFamily: 'inherit',
                            background: '#fff', cursor: 'pointer',
                          }}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button
                          onClick={() => handleDelete(user)}
                          style={{
                            background: 'none', border: '1px solid #FCA5A5',
                            borderRadius: 4, padding: '5px 8px',
                            cursor: 'pointer', color: '#EF4444',
                            display: 'flex', alignItems: 'center',
                            transition: 'background 0.15s',
                          }}
                          title="Delete user"
                          onMouseEnter={e => e.currentTarget.style.background = '#FEE2E2'}
                          onMouseLeave={e => e.currentTarget.style.background = 'none'}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
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
          { to: '/admin/users',      Icon: Users,           label: 'Users', active: true },
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

export default UserManagement;
