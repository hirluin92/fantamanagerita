import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFutbol, faUser, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../hooks/useAuth';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import '../styles/NavBar.css';

const NavBar = () => {
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <FontAwesomeIcon icon={faFutbol} /> FantaManager
        </Link>
        <div className="navbar-links">
          {user ? (
            <>
              <Link to="/dashboard" className="navbar-item">
                <FontAwesomeIcon icon={faUser} /> Dashboard
              </Link>
              <button onClick={handleLogout} className="navbar-item navbar-item-highlight">
                <FontAwesomeIcon icon={faSignOutAlt} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-item">Accedi</Link>
              <Link to="/signup" className="navbar-item navbar-item-highlight">Registrati</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;