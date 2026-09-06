import { useState } from 'react';
import './RequestOffers.css';

function Request() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    rentalType: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Request submitted:', formData);
    alert('Request submitted successfully!');
  };

  return (
    <section className="request-section">
      <div className="container">
        <h2>Submit Your Rental Request</h2>
        <form onSubmit={handleSubmit} className="request-form">
          <div className="form-group">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              className="form-control"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              className="form-control"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <select
              name="rentalType"
              className="form-control"
              value={formData.rentalType}
              onChange={handleChange}
              required
            >
              <option value="">Select Rental Type</option>
              <option value="vehicle">Vehicle</option>
              <option value="equipment">Equipment</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <textarea
              name="message"
              placeholder="Your Message"
              className="form-control"
              rows="4"
              value={formData.message}
              onChange={handleChange}
              required
            ></textarea>
          </div>
          <button type="submit" className="btn btn-primary">Submit Request</button>
        </form>
      </div>
    </section>
  );
}

export default Request;
