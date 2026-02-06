import React from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

function Navbar() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div className="navbar">
      <div className="navbar-content">
        <div className="navbar-title">
          Assitance Tafilalet - Gestion
        </div>
        <div className="navbar-user">
          <div className="user-badge">
            👤 {user?.login} ({user?.role === 'admin' ? 'Administrateur' : 'Employé'})
          </div>
          <button onClick={handleLogout} className="btn-logout">
            🚪 Déconnexion
          </button>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
