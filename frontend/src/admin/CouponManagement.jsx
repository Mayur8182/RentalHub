import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, Car, FolderTree, FileText,
  Users, ArrowLeft, MessageSquare, TrendingUp,
  Activity, Tag, Trash2, ToggleLeft, ToggleRight, Plus,
} from 'lucide-react';
import { couponAPI } from '../utils/api';
import './Dashboard.css';
import './CouponManagement.css';

const EMPTY = {
  code: '', description: '', discountType: 'percentage',
  discountValue: '', minOrderAmount: '', maxUses: '', expiresAt: '',
};

function CouponManagement() {
  const [coupons,   setCoupons]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [form,      setForm]      = useState(EMPTY);
  const [saving,    setSaving]    = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => { fetchCoupons(); }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await couponAPI.getAll();
      setCoupons(res.data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.code.trim() || !form.discountValue) {
      setFormError('Code and discount value are required.');
      return;
    }
    try {
      setSaving(true);
      await couponAPI.create({
        ...form,
        code: form.code.toUpperCase().trim(),
        discountValue:   Number(form.discountValue),
        minOrderAmount:  form.minOrderAmount  ? Number(form.minOrderAmount)  : 0,
        maxUses:         form.maxUses         ? Number(form.maxUses)         : null,
        expiresAt:       form.expiresAt       || null,
      });
      setForm(EMPTY);
      setShowForm(false);
      fetchCoupons();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create coupon.');
    } finally { setSaving(false); }
  };

  const handleToggle = async (id) => {
    await couponAPI.toggle(id);
    fetchCoupons();
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Delete coupon "${code}"?`)) return;
    await couponAPI.delete(id);
    fetchCoupons();
  };

  const fmtDate = (s) => s ? new Date(s).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  return (
    <div className="admin-page">
      <Sidebar />
      <div className="admin-content">
        {/* Header */}
        <div className="dash-topbar">
          <div>
            <h1>Coupon Management</h1>
            <p className="admin-subtitle">{coupons.length} coupon{coupons.length !== 1 ? 's' : ''} created</p>
          </div>
          <button
            className="admin-action-btn approve"
            onClick={() => { setShowForm(s => !s); setFormError(''); setForm(EMPTY); }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px' }}
          >
            <Plus size={16} /> {showForm ? 'Cancel' : 'New Coupon'}
          </button>
        </div>

        {/* Create form */}
        {showForm && (
          <div className="admin-table-section" style={{ marginBottom: 24 }}>
            <h2 style={{ marginBottom: 20 }}>Create Coupon</h2>
            {formError && <div className="dash-error" style={{ marginBottom: 16 }}>{formError}</div>}
            <form onSubmit={handleCreate}>
              <div className="cp-form-grid">
                <div className="cp-field">
                  <label>Code <span style={{ color: '#EF4444' }}>*</span></label>
                  <input className="form-control cp-mono" placeholder="RENTAL20" value={form.code}
                    onChange={e => set('code', e.target.value.toUpperCase())} required />
                </div>
                <div className="cp-field">
                  <label>Description</label>
                  <input className="form-control" placeholder="20% off for all users" value={form.description}
                    onChange={e => set('description', e.target.value)} />
                </div>
                <div className="cp-field">
                  <label>Discount Type <span style={{ color: '#EF4444' }}>*</span></label>
                  <select className="form-control" value={form.discountType} onChange={e => set('discountType', e.target.value)}>
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div className="cp-field">
                  <label>Discount Value <span style={{ color: '#EF4444' }}>*</span></label>
                  <input className="form-control" type="number" min="1"
                    placeholder={form.discountType === 'percentage' ? '20  (= 20%)' : '500  (= ₹500)'}
                    value={form.discountValue} onChange={e => set('discountValue', e.target.value)} required />
                </div>
                <div className="cp-field">
                  <label>Min Order Amount (₹)</label>
                  <input className="form-control" type="number" min="0" placeholder="0 = no minimum"
                    value={form.minOrderAmount} onChange={e => set('minOrderAmount', e.target.value)} />
                </div>
                <div className="cp-field">
                  <label>Max Uses</label>
                  <input className="form-control" type="number" min="1" placeholder="Blank = unlimited"
                    value={form.maxUses} onChange={e => set('maxUses', e.target.value)} />
                </div>
                <div className="cp-field">
                  <label>Expires At</label>
                  <input className="form-control" type="date"
                    min={new Date().toISOString().slice(0, 10)}
                    value={form.expiresAt} onChange={e => set('expiresAt', e.target.value)} />
                </div>
              </div>
              <button type="submit" className="admin-action-btn approve" disabled={saving} style={{ marginTop: 16, padding: '10px 24px' }}>
                {saving ? 'Saving…' : 'Create Coupon'}
              </button>
            </form>
          </div>
        )}

        {/* Table */}
        <div className="admin-table-section">
          <div className="dash-section-header">
            <h2>All Coupons</h2>
          </div>
          {loading ? <p>Loading…</p> : coupons.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#888' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🏷️</div>
              <p>No coupons yet. Create your first one above.</p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Description</th>
                  <th>Discount</th>
                  <th>Min Order</th>
                  <th>Uses</th>
                  <th>Expires</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map(c => (
                  <tr key={c._id}>
                    <td>
                      <span className="cp-code-badge">{c.code}</span>
                    </td>
                    <td style={{ color: '#6B7280', fontSize: 13 }}>{c.description || '—'}</td>
                    <td>
                      <span className="cp-discount-badge" style={{
                        background: c.discountType === 'percentage' ? '#EDE9FE' : '#D1FAE5',
                        color:      c.discountType === 'percentage' ? '#6D28D9' : '#065F46',
                      }}>
                        {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                      </span>
                    </td>
                    <td style={{ fontSize: 13 }}>{c.minOrderAmount > 0 ? `₹${c.minOrderAmount.toLocaleString('en-IN')}` : '—'}</td>
                    <td style={{ fontSize: 13 }}>
                      {c.usedCount}{c.maxUses ? ` / ${c.maxUses}` : ' / ∞'}
                    </td>
                    <td style={{ fontSize: 13 }}>{fmtDate(c.expiresAt)}</td>
                    <td>
                      <span style={{
                        display: 'inline-block', padding: '3px 10px', borderRadius: 12,
                        fontSize: 11, fontWeight: 700,
                        background: c.isActive ? '#D1FAE5' : '#F3F4F6',
                        color:      c.isActive ? '#065F46' : '#6B7280',
                      }}>
                        {c.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          onClick={() => handleToggle(c._id)}
                          title={c.isActive ? 'Deactivate' : 'Activate'}
                          style={{
                            background: c.isActive ? '#FEF3C7' : '#D1FAE5',
                            color:      c.isActive ? '#92400E' : '#065F46',
                            border:     `1px solid ${c.isActive ? '#FCD34D' : '#A7F3D0'}`,
                            borderRadius: 4, padding: '5px 8px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center',
                          }}
                        >
                          {c.isActive ? <ToggleLeft size={14} /> : <ToggleRight size={14} />}
                        </button>
                        <button
                          onClick={() => handleDelete(c._id, c.code)}
                          title="Delete"
                          style={{
                            background: 'none', border: '1px solid #FCA5A5',
                            borderRadius: 4, padding: '5px 8px', cursor: 'pointer',
                            color: '#EF4444', display: 'flex', alignItems: 'center',
                          }}
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
          { to: '/admin/coupons',    Icon: Tag,             label: 'Coupons', active: true },
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

export default CouponManagement;
