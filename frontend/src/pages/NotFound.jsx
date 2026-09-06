import { Link, useNavigate } from 'react-router-dom';
import './NotFound.css';

function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="nf-page">
      <div className="nf-content">
        <div className="nf-code">404</div>
        <div className="nf-car">🚗</div>
        <h1 className="nf-title">Looks like you took a wrong turn</h1>
        <p className="nf-sub">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="nf-actions">
          <Link to="/" className="btn btn-primary">Go Home</Link>
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
            Go Back
          </button>
          <Link to="/fleet" className="btn btn-secondary">Browse Fleet</Link>
        </div>

        {/* Road decoration */}
        <div className="nf-road">
          <div className="nf-road-line" />
          <div className="nf-road-line" />
          <div className="nf-road-line" />
        </div>
      </div>
    </div>
  );
}

export default NotFound;
