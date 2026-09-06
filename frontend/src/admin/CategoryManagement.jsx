import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Car, FolderTree, FileText, Users, ArrowLeft, Plus, MessageSquare, TrendingUp, Activity } from 'lucide-react';
import { categoryAPI } from '../utils/api';
import './Dashboard.css';

function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryAPI.getAll();
      setCategories(response.data);
      setLoading(false);
    } catch (err) {
      alert('Failed to fetch categories');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await categoryAPI.create(formData);
      setShowForm(false);
      setFormData({ name: '', description: '' });
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create category');
    }
  };

  return (
    <div className="admin-page">
      <aside className="admin-sidebar">
        <h3>ADMIN PANEL</h3>
        <ul>
          <li>
            <Link to="/admin">
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link to="/admin/vehicles">
              <Car size={18} />
              <span>Vehicles</span>
            </Link>
          </li>
          <li className="active">
            <Link to="/admin/categories">
              <FolderTree size={18} />
              <span>Categories</span>
            </Link>
          </li>
          <li>
            <Link to="/admin/bookings">
              <FileText size={18} />
              <span>Bookings</span>
            </Link>
          </li>
          <li>
            <Link to="/admin/users">
              <Users size={18} />
              <span>Users</span>
            </Link>
          </li>
          <li>
            <Link to="/admin/contacts">
              <MessageSquare size={18} />
              <span>Contacts</span>
            </Link>
          </li>
          <li>
            <Link to="/admin/activity">
              <Activity size={18} />
              <span>Activity Log</span>
            </Link>
          </li>
          <li>
            <Link to="/">
              <ArrowLeft size={18} />
              <span>Back to Site</span>
            </Link>
          </li>
        </ul>
      </aside>

      <div className="admin-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h1>Category Management</h1>
            <p className="admin-subtitle">Organize your vehicle fleet</p>
          </div>
          <button 
            className="admin-action-btn approve"
            onClick={() => setShowForm(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}
          >
            <Plus size={18} />
            Add Category
          </button>
        </div>

        {showForm && (
          <div className="admin-table-section" style={{ marginBottom: '20px' }}>
            <h2>Add New Category</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '600' }}>Category Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '600' }}>Description</label>
                <textarea
                  className="form-control"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" className="admin-action-btn approve">
                  Create Category
                </button>
                <button 
                  type="button" 
                  className="admin-action-btn reject"
                  onClick={() => { setShowForm(false); setFormData({ name: '', description: '' }); }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="admin-table-section">
          <h2>All Categories</h2>
          {loading ? (
            <p>Loading...</p>
          ) : categories.length === 0 ? (
            <p>No categories found. Add your first category!</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {categories.map((category) => (
                <div 
                  key={category._id}
                  style={{
                    border: '1px solid #E8E8E8',
                    borderRadius: '4px',
                    padding: '20px',
                    backgroundColor: '#FFF'
                  }}
                >
                  <h3 style={{ fontSize: '18px', marginBottom: '8px', fontWeight: '600' }}>
                    {category.name}
                  </h3>
                  <p style={{ fontSize: '14px', color: '#555', marginBottom: '0' }}>
                    {category.description || 'No description'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CategoryManagement;
