import { Link } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext';
import FavoriteButton from '../components/FavoriteButton';
import './Favorites.css';

function Favorites() {
  const { favorites, clearFavorites } = useFavorites();

  return (
    <div className="fav-page">
      <div className="container">
        {/* Page header */}
        <div className="fav-page-header">
          <div>
            <h1 className="fav-page-title">
              <span className="fav-page-heart">♥</span> My Favorites
            </h1>
            <p className="fav-page-subtitle">
              {favorites.length === 0
                ? 'You haven\'t saved any vehicles yet.'
                : `${favorites.length} saved vehicle${favorites.length !== 1 ? 's' : ''}`}
            </p>
          </div>

          {favorites.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Clear all favorites?')) clearFavorites();
              }}
              className="fav-clear-btn"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Empty state */}
        {favorites.length === 0 && (
          <div className="fav-empty">
            <div className="fav-empty-icon">♡</div>
            <h2>No favorites yet</h2>
            <p>Click the heart on any vehicle to save it here.</p>
            <Link to="/fleet" className="btn btn-primary">
              Browse Vehicles
            </Link>
          </div>
        )}

        {/* Favorites grid */}
        {favorites.length > 0 && (
          <div className="fav-grid">
            {favorites.map((vehicle) => (
              <div key={vehicle._id} className="fav-card">
                {/* Image */}
                <div className="fav-card-image-wrap">
                  <img
                    src={vehicle.image}
                    alt={vehicle.name}
                    className="fav-card-image"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/400x220?text=Vehicle+Image';
                    }}
                  />
                  {/* Heart button — position absolute over image */}
                  <FavoriteButton
                    vehicle={vehicle}
                    size="sm"
                    className="fav-card-heart"
                  />
                  {/* Availability badge */}
                  <span className={`fav-card-badge ${vehicle.availability ? 'available' : 'unavailable'}`}>
                    {vehicle.availability ? '● Available' : '● Unavailable'}
                  </span>
                </div>

                {/* Info */}
                <div className="fav-card-body">
                  <div className="fav-card-top">
                    <div>
                      <h3 className="fav-card-name">{vehicle.name}</h3>
                      <p className="fav-card-brand">{vehicle.brand}</p>
                    </div>
                    <div className="fav-card-price">
                      <span>₹{vehicle.pricePerDay.toLocaleString('en-IN')}</span>
                      <span className="fav-card-per-day">/ day</span>
                    </div>
                  </div>

                  {/* Quick specs */}
                  <div className="fav-card-specs">
                    {vehicle.seats && (
                      <span className="fav-card-spec">👥 {vehicle.seats} seats</span>
                    )}
                    {vehicle.transmission && (
                      <span className="fav-card-spec">⚙️ {vehicle.transmission}</span>
                    )}
                    {vehicle.fuel && (
                      <span className="fav-card-spec">⛽ {vehicle.fuel}</span>
                    )}
                    {vehicle.year && (
                      <span className="fav-card-spec">📅 {vehicle.year}</span>
                    )}
                  </div>

                  <Link
                    to={`/vehicles/${vehicle._id}`}
                    className="btn btn-primary fav-card-btn"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Favorites;
