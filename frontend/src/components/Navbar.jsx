import './Navbar.css';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';

function Navbar() {
  const { user, logout } = useAuth();
  const { favorites } = useFavorites();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark">
      <div className="container">
        <Link className="navbar-brand" to="/">
          RENTALHUB
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">HOME</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/fleet">FLEET</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/about">ABOUT</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/team">TEAM</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/contact">CONTACT</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link nav-link-favorites" to="/favorites">
                ♥
                {favorites.length > 0 && (
                  <span className="nav-fav-count">{favorites.length}</span>
                )}
              </Link>
            </li>
            
            {user ? (
              <>
                {user.role === 'admin' && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/admin">ADMIN</Link>
                  </li>
                )}
                <li className="nav-item">
                  <Link className="nav-link" to="/profile">
                    {user.name}
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/my-bookings">MY BOOKINGS</Link>
                </li>
                <li className="nav-item">
                  <button 
                    className="nav-link nav-link-logout" 
                    onClick={handleLogout}
                  >
                    LOGOUT
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">LOGIN</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link nav-link-login" to="/register">REGISTER</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
