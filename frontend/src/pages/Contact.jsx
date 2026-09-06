import { useState } from 'react';
import Hero from '../components/Hero';
import './Contact.css';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitted(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          message: ''
        });
        setTimeout(() => {
          setSubmitted(false);
        }, 5000);
      } else {
        setError(data.message || 'Failed to send message. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      <Hero title="Contact Us" subtitle="Get in touch with our team" />
      <section className="contact-section">
        <div className="container">
          <div className="contact-container">
            <div className="contact-info">
              <h2>Get In Touch</h2>
              <p>Have questions? We'd love to hear from you. Contact us using the form or reach out directly.</p>
              
              <div className="contact-details">
                <div className="detail-item">
                  <h4>📍 Address</h4>
                  <p>7th Floor, Premchand House<br />Ashram Road, Ahmedabad – 380009</p>
                </div>
                
                <div className="detail-item">
                  <h4>📞 Phone</h4>
                  <p>+91 96389 37336</p>
                </div>
                
                <div className="detail-item">
                  <h4>✉️ Email</h4>
                  <p>contact@brainybeam.com</p>
                </div>
                
                <div className="detail-item">
                  <h4>🕐 Working Hours</h4>
                  <p>Mon - Fri: 9:00 AM - 6:00 PM<br />Sat - Sun: Closed</p>
                </div>
              </div>
            </div>
            
            <div className="contact-form-wrapper">
              {submitted && (
                <div className="success-message">
                  ✅ Thank you! Your message has been sent successfully. We'll get back to you soon!
                </div>
              )}
              {error && (
                <div className="error-message" style={{
                  backgroundColor: '#fee',
                  color: '#c33',
                  padding: '12px',
                  borderRadius: '4px',
                  marginBottom: '20px',
                  border: '1px solid #fcc'
                }}>
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-group">
                  <input
                    type="text"
                    name="name"
                    placeholder="Your Name"
                    className="form-control"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <input
                    type="email"
                    name="email"
                    placeholder="Your Email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Your Phone"
                    className="form-control"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <textarea
                    name="message"
                    placeholder="Your Message (minimum 10 characters)"
                    className="form-control"
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    minLength="10"
                    maxLength="1000"
                    disabled={loading}
                  ></textarea>
                </div>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Contact;
