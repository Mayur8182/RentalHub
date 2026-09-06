import { useFavorites } from '../context/FavoritesContext';
import './FavoriteButton.css';

/**
 * Heart toggle button.
 *
 * Props:
 *   vehicle  — full vehicle object (required)
 *   size     — 'sm' | 'md' (default 'md')
 *   className — extra class names
 */
function FavoriteButton({ vehicle, size = 'md', className = '' }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const active = isFavorite(vehicle._id);

  const handleClick = (e) => {
    // Prevent bubbling so clicks on a card don't trigger navigation
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(vehicle);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`fav-btn fav-btn--${size} ${active ? 'fav-btn--active' : ''} ${className}`}
      aria-label={active ? 'Remove from favorites' : 'Add to favorites'}
      title={active ? 'Remove from favorites' : 'Add to favorites'}
    >
      {/* Solid heart when active, outline when not */}
      {active ? '♥' : '♡'}
    </button>
  );
}

export default FavoriteButton;
