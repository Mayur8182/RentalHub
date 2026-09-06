import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingAPI } from '../utils/api';

function BookingForm({ vehicleId, pricePerDay }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    pickupLocation: '',
    returnLocation: '',
    additionalNotes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const calculateDays = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diff = end - start;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const calculateTotal = () => {
    const days = calculateDays();
    return days > 0 ? days * pricePerDay : 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      setError('Start date cannot be in the past');
      return;
    }

    if (end <= start) {
      setError('End date must be after start date');
      return;
    }

    const days = calculateDays();
    if (days <= 0) {
      setError('Invalid date range');
      return;
    }

    try {
      setLoading(true);
      const bookingData = {
        vehicleId,
        startDate: formData.startDate,
        endDate: formData.endDate,
        totalAmount: calculateTotal(),
        pickupLocation: formData.pickupLocation,
        returnLocation: formData.returnLocation,
        additionalNotes: formData.additionalNotes
      };

      await bookingAPI.create(bookingData);
      alert('Booking request submitted successfully!');
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit booking request');
      setLoading(false);
    }
  };

  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      border: '1px solid #E8E8E8',
      borderRadius: '4px',
      padding: '24px',
      maxWidth: '500px'
    }}>
      <h3 style={{ fontSize: '20px', marginBottom: '20px', fontWeight: '600' }}>Book This Vehicle</h3>
      
      {error && (
        <div style={{
          backgroundColor: '#fee',
          color: '#c33',
          padding: '12px',
          borderRadius: '4px',
          marginBottom: '16px',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>
            Start Date
          </label>
          <input
            type="date"
            className="form-control"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            required
            disabled={loading}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>
            End Date
          </label>
          <input
            type="date"
            className="form-control"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            required
            disabled={loading}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>
            Pickup Location
          </label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter pickup location"
            value={formData.pickupLocation}
            onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
            required
            disabled={loading}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>
            Return Location
          </label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter return location"
            value={formData.returnLocation}
            onChange={(e) => setFormData({ ...formData, returnLocation: e.target.value })}
            required
            disabled={loading}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>
            Additional Notes (Optional)
          </label>
          <textarea
            className="form-control"
            placeholder="Any special requirements?"
            rows="3"
            value={formData.additionalNotes}
            onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
            disabled={loading}
          />
        </div>

        {calculateDays() > 0 && (
          <div style={{
            backgroundColor: '#F4F1E8',
            padding: '16px',
            borderRadius: '4px',
            marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', color: '#555' }}>Duration:</span>
              <span style={{ fontSize: '14px', fontWeight: '600' }}>{calculateDays()} day(s)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', color: '#555' }}>Price per day:</span>
              <span style={{ fontSize: '14px', fontWeight: '600' }}>₹{pricePerDay.toLocaleString('en-IN')}</span>
            </div>
            <div style={{
              borderTop: '1px solid #E8E8E8',
              paddingTop: '8px',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span style={{ fontSize: '16px', fontWeight: '600' }}>Total Amount:</span>
              <span style={{ fontSize: '18px', fontWeight: '700', color: '#111' }}>
                ₹{calculateTotal().toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%' }}
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit Booking Request'}
        </button>
      </form>
    </div>
  );
}

export default BookingForm;
