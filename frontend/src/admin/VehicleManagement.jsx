import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, Car, FolderTree, FileText,
  Users, ArrowLeft, Plus, Edit, Trash2,
  MessageSquare, TrendingUp, Activity,
} from 'lucide-react';
import { vehicleAPI, categoryAPI } from '../utils/api';
import './Dashboard.css';

const TRANSMISSIONS = ['Manual', 'Automatic'];
const FUELS         = ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG'];
const EMPTY_FORM = {
  name: '', brand: '', category: '', pricePerDay: '',
  image: '', description: '', location: '',
  availability: true, seats: '', transmission: 'Manual',
  fuel: 'Petrol', year: '', features: '',
};

function VehicleManagement() {
  const [vehicles,       setVehicles]       = useState([]);
  const [categories,     setCategories]     = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [showForm,       setShowForm]       = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formData,       setFormData]       = useState(EMPTY_FORM);
  const [search,         setSearch]         = useState('');
  const [filterCat,      setFilterCat]      = useState('all');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [vr, cr] = await Promise.all([vehicleAPI.getAll(), categoryAPI.getAll()]);
      setVehicles(vr.data);
      setCategories(cr.data);
    } catch { alert('Failed to fetch data'); }
    finally { setLoading(false); }
  };

  const set = (field, value) => setFormData(f => ({ ...f, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Convert features string → array
    const payload = {
      ...formData,
      features: formData.features
        ? formData.features.split(',').map(s => s.trim()).filter(Boolean)
        : [],
      seats: formData.seats ? Number(formData.seats) : undefined,
      pricePerDay: Number(formData.pricePerDay),
      year: formData.year ? Number(formData.year) : undefined,
    };
    try {
      if (editingVehicle) {
        await vehicleAPI.update(editingVehicle._id, payload);
      } else {
        await vehicleAPI.create(payload);
      }
      setShowForm(false); setEditingVehicle(null); setFormData(EMPTY_FORM);
      fetchData();
    } catch (err) { alert(err.response?.data?.message || 'Failed to save vehicle'); }
  };

  const handleEdit = (v) => {
    setEditingVehicle(v);
    setFormData({
      name:         v.name,
      brand:        v.brand,
      category:     v.category?._id || v.category,
      pricePerDay:  v.pricePerDay,
      image:        v.image,
      description:  v.description,
      location:     v.location || '',
      availability: v.availability,
      seats:        v.seats || '',
      transmission: v.transmission || 'Manual',
      fuel:         v.fuel || 'Petrol',
      year:         v.year || '',
      features:     Array.isArray(v.features) ? v.features.join(', ') : '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this vehicle?')) return;
    try { await vehicleAPI.delete(id); fetchData(); }
    catch (err) { alert(err.response?.data?.message || 'Failed to delete'); }
  };

  const filtered = vehicles
    .filter(v => filterCat === 'all' || v.category?._id === filterCat)
    .filter(v => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return v.name.toLowerCase().includes(q) || v.brand.toLowerCase().includes(q) ||
             (v.location || '').toLowerCase().includes(q);
    });

  const field = (label, children, span = false) => (
    <div style={{ gridColumn: span ? 'span 2' : undefined }}>
      <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 700, color: '#374151' }}>{label}</label>
      {children}
    </div>
  );

  const input = (props) => (
    <input className="form-control" style={{ fontSize: 14 }} {...props} />
  );

  return (
    <div className="admin-page">
      <Sidebar />
      <div className="admin-content">
        {/* Header */}
        <div className="dash-topbar">
          <div>
            <h1>Vehicle Management</h1>
            <p className="admin-subtitle">Manage your rental fleet · {vehicles.length} vehicles</p>
          </div>
          <button
            className="admin-action-btn approve"
            onClick={() => { setShowForm(true); setEditingVehicle(null); setFormData(EMPTY_FORM); }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px' }}
          >
            <Plus size={16} /> Add Vehicle
          </button>
        </div>

        {/* ── Add / Edit form ──────────────────────────────────────── */}
        {showForm && (
          <div className="admin-table-section" style={{ marginBottom: 24 }}>
            <div className="dash-section-header" style={{ marginBottom: 20 }}>
              <h2>{editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</h2>
              <button className="admin-action-btn reject"
                onClick={() => { setShowForm(false); setEditingVehicle(null); setFormData(EMPTY_FORM); }}>
                Cancel
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                {field('Vehicle Name',    input({ value: formData.name, onChange: e => set('name', e.target.value), required: true, placeholder: 'e.g. City' }))}
                {field('Brand',           input({ value: formData.brand, onChange: e => set('brand', e.target.value), required: true, placeholder: 'e.g. Honda' }))}
                {field('Category',
                  <select className="form-control" style={{ fontSize: 14 }} value={formData.category}
                    onChange={e => set('category', e.target.value)} required>
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                )}
                {field('Price Per Day (₹)', input({ type: 'number', value: formData.pricePerDay, onChange: e => set('pricePerDay', e.target.value), required: true, min: 1 }))}
                {field('Seats',           input({ type: 'number', value: formData.seats, onChange: e => set('seats', e.target.value), min: 1, max: 20, placeholder: '5' }))}
                {field('Year',            input({ type: 'number', value: formData.year, onChange: e => set('year', e.target.value), min: 2000, max: new Date().getFullYear() + 1, placeholder: '2024' }))}
                {field('Transmission',
                  <select className="form-control" style={{ fontSize: 14 }} value={formData.transmission}
                    onChange={e => set('transmission', e.target.value)}>
                    {TRANSMISSIONS.map(t => <option key={t}>{t}</option>)}
                  </select>
                )}
                {field('Fuel Type',
                  <select className="form-control" style={{ fontSize: 14 }} value={formData.fuel}
                    onChange={e => set('fuel', e.target.value)}>
                    {FUELS.map(f => <option key={f}>{f}</option>)}
                  </select>
                )}
                {field('Location',        input({ value: formData.location, onChange: e => set('location', e.target.value), placeholder: 'e.g. Mumbai' }))}

                {/* Image URL + preview */}
                {field('Image URL',
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <input className="form-control" style={{ fontSize: 14, flex: 1 }}
                      value={formData.image} onChange={e => set('image', e.target.value)} required
                      placeholder="https://…" />
                    {formData.image && (
                      <img src={formData.image} alt="preview"
                        onError={e => { e.target.style.display = 'none'; }}
                        style={{ width: 64, height: 42, objectFit: 'cover', borderRadius: 4, border: '1px solid #E8E8E8', flexShrink: 0 }}
                      />
                    )}
                  </div>
                )}

                {field('Features (comma-separated)',
                  input({
                    value: formData.features, onChange: e => set('features', e.target.value),
                    placeholder: 'Air Conditioning, Bluetooth, GPS, Sunroof',
                  })
                )}

                {field('Description',
                  <textarea className="form-control" rows={3} style={{ fontSize: 14 }}
                    value={formData.description} onChange={e => set('description', e.target.value)} required />,
                  true
                )}

                <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: 20 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                    <input type="checkbox" checked={formData.availability}
                      onChange={e => set('availability', e.target.checked)}
                      style={{ width: 16, height: 16 }} />
                    Available for Rent
                  </label>
                  <button type="submit" className="admin-action-btn approve" style={{ padding: '10px 24px', fontSize: 14 }}>
                    {editingVehicle ? 'Update Vehicle' : 'Create Vehicle'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* ── Filters ───────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20, alignItems: 'center' }}>
          <input type="text" placeholder="Search vehicles…" value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ padding: '9px 14px', border: '1px solid #E8E8E8', borderRadius: 6, fontSize: 14, width: 240, fontFamily: 'inherit', outline: 'none' }} />
          <button onClick={() => setFilterCat('all')} style={{
            padding: '7px 14px', border: filterCat === 'all' ? '2px solid #111' : '1px solid #E8E8E8',
            background: filterCat === 'all' ? '#111' : '#fff', color: filterCat === 'all' ? '#fff' : '#111',
            borderRadius: 4, cursor: 'pointer', fontSize: 13, fontWeight: 600,
          }}>All</button>
          {categories.map(c => (
            <button key={c._id} onClick={() => setFilterCat(c._id)} style={{
              padding: '7px 14px', border: filterCat === c._id ? '2px solid #111' : '1px solid #E8E8E8',
              background: filterCat === c._id ? '#111' : '#fff', color: filterCat === c._id ? '#fff' : '#111',
              borderRadius: 4, cursor: 'pointer', fontSize: 13, fontWeight: 600,
            }}>{c.name}</button>
          ))}
        </div>

        {/* ── Table ─────────────────────────────────────────────── */}
        <div className="admin-table-section">
          <div className="dash-section-header">
            <h2>Vehicles <span style={{ fontSize: 13, color: '#888', fontWeight: 500 }}>({filtered.length})</span></h2>
          </div>
          {loading ? <p>Loading…</p> : filtered.length === 0 ? (
            <p style={{ color: '#888', padding: '20px 0' }}>No vehicles found.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Vehicle</th><th>Category</th><th>Specs</th>
                  <th>Price/Day</th><th>Location</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(v => (
                  <tr key={v._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <img src={v.image} alt={v.name}
                          onError={e => { e.target.src = 'https://via.placeholder.com/48x32?text=?'; }}
                          style={{ width: 56, height: 36, objectFit: 'cover', borderRadius: 4, border: '1px solid #E8E8E8', flexShrink: 0 }}
                        />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{v.name}</div>
                          <div style={{ fontSize: 12, color: '#9CA3AF' }}>{v.brand}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 13 }}>{v.category?.name || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {v.seats        && <span style={chip}>{v.seats} seats</span>}
                        {v.transmission && <span style={chip}>{v.transmission}</span>}
                        {v.fuel         && <span style={chip}>{v.fuel}</span>}
                        {v.year         && <span style={chip}>{v.year}</span>}
                      </div>
                    </td>
                    <td style={{ fontWeight: 700 }}>₹{v.pricePerDay.toLocaleString('en-IN')}</td>
                    <td style={{ fontSize: 13, color: '#6B7280' }}>{v.location || '—'}</td>
                    <td>
                      <span style={{
                        display: 'inline-block', padding: '3px 10px', borderRadius: 12,
                        fontSize: 11, fontWeight: 700,
                        background: v.availability ? '#D1FAE5' : '#FEE2E2',
                        color:      v.availability ? '#065F46' : '#991B1B',
                      }}>
                        {v.availability ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="admin-action-btn edit" onClick={() => handleEdit(v)}
                          style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                          <Edit size={13} /> Edit
                        </button>
                        <button className="admin-action-btn reject" onClick={() => handleDelete(v._id)}
                          style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                          <Trash2 size={13} /> Delete
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

const chip = {
  background: '#F3F4F6', color: '#374151', borderRadius: 10,
  padding: '2px 7px', fontSize: 11, fontWeight: 600,
};

function Sidebar() {
  return (
    <aside className="admin-sidebar">
      <h3>ADMIN PANEL</h3>
      <ul>
        {[
          { to: '/admin',            Icon: LayoutDashboard, label: 'Dashboard' },
          { to: '/admin/vehicles',   Icon: Car,             label: 'Vehicles', active: true },
          { to: '/admin/categories', Icon: FolderTree,      label: 'Categories' },
          { to: '/admin/bookings',   Icon: FileText,        label: 'Bookings' },
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

export default VehicleManagement;
