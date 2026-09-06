import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>🚗 RENTALHUB</h3>
            <p>
              Your trusted partner for premium vehicle rentals. We offer a wide range
              of vehicles with competitive pricing and exceptional service.
            </p>
          </div>

          <div className="footer-links">
            <h4>QUICK LINKS</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/fleet">Fleet</Link></li>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/team">Team</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          <div className="footer-links">
            <h4>ACCOUNT</h4>
            <ul>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register">Register</Link></li>
              <li><Link to="/profile">My Dashboard</Link></li>
            </ul>
          </div>

          <div className="footer-contact">
            <h4>CONTACT US</h4>
            <p>📍 7th Floor, Premchand House, Ashram Road, Ahmedabad – 380009</p>
            <p>📞 +91 96389 37336</p>
            <p>✉️ contact@brainybeam.com</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} RentalHub. All rights reserved. | Developed by Mayurbhai Bharvad</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
