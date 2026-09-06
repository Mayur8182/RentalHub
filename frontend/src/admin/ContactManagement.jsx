import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Car, FolderTree, FileText, Users, ArrowLeft, MessageSquare, TrendingUp, Activity } from 'lucide-react';
import './Dashboard.css';

function ContactManagement() {
  const [contacts, setContacts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedMessage, setExpandedMessage] = useState(null);

  useEffect(() => {
    fetchContacts();
  }, [filter]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/contacts/admin/contacts?status=${filter}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setContacts(data.contacts || []);
      } else {
        setError(data.message || 'Failed to fetch contacts');
      }
      setLoading(false);
    } catch (err) {
      setError('Network error. Failed to fetch contacts.');
      setLoading(false);
    }
  };

  const handleStatusChange = async (contactId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/contacts/admin/contacts/${contactId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh contacts list
        fetchContacts();
      } else {
        alert(data.message || 'Failed to update status');
      }
    } catch (err) {
      alert('Network error. Failed to update status.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateMessage = (message, maxLength = 50) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
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
          <li>
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
          <li className="active">
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
        <h1>Contact Management</h1>
        <p className="admin-subtitle">Manage customer inquiries and messages</p>

        {error && (
          <div style={{
            backgroundColor: '#fee',
            color: '#c33',
            padding: '12px',
            borderRadius: '4px',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        <div className="filter-tabs" style={{ marginBottom: '20px' }}>
          <button
            className={filter === 'all' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setFilter('all')}
          >
            All ({contacts.length})
          </button>
          <button
            className={filter === 'pending' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setFilter('pending')}
          >
            Pending
          </button>
          <button
            className={filter === 'resolved' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setFilter('resolved')}
          >
            Resolved
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Loading contacts...</div>
        ) : contacts.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
            No contact queries found.
          </div>
        ) : (
          <div className="admin-table-section">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Message</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact) => (
                  <tr key={contact._id}>
                    <td>{contact.name}</td>
                    <td>{contact.email}</td>
                    <td>{contact.phone || 'N/A'}</td>
                    <td>
                      {expandedMessage === contact._id ? (
                        <div>
                          {contact.message}
                          <button
                            onClick={() => setExpandedMessage(null)}
                            style={{
                              marginLeft: '8px',
                              color: '#667eea',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              textDecoration: 'underline'
                            }}
                          >
                            Show less
                          </button>
                        </div>
                      ) : (
                        <div>
                          {truncateMessage(contact.message)}
                          {contact.message.length > 50 && (
                            <button
                              onClick={() => setExpandedMessage(contact._id)}
                              style={{
                                marginLeft: '8px',
                                color: '#667eea',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                textDecoration: 'underline'
                              }}
                            >
                              Read more
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                    <td>{formatDate(contact.createdAt)}</td>
                    <td>
                      <span className={`status-badge ${contact.status}`}>
                        {contact.status}
                      </span>
                    </td>
                    <td>
                      {contact.status === 'pending' ? (
                        <button
                          className="admin-action-btn approve"
                          onClick={() => handleStatusChange(contact._id, 'resolved')}
                        >
                          Mark Resolved
                        </button>
                      ) : (
                        <button
                          className="admin-action-btn"
                          onClick={() => handleStatusChange(contact._id, 'pending')}
                          style={{ backgroundColor: '#f39c12' }}
                        >
                          Mark Pending
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ContactManagement;
