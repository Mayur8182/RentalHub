import { Link } from 'react-router-dom';
import './Banner.css';

function Banner() {
  const scrollToFeatures = () => {
    const featuresSection = document.querySelector('.request-section');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="banner">
      <div className="banner-content">
        <h1>Premium Vehicle Rentals Made Simple</h1>
        <p>Discover a wide range of vehicles for every journey. Book instantly, drive confidently, and explore without limits.</p>
        <div className="banner-buttons">
          <Link to="/fleet" className="btn btn-primary btn-lg">
            Browse Fleet
          </Link>
          <button onClick={scrollToFeatures} className="btn btn-secondary btn-lg">
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
}

export default Banner;
