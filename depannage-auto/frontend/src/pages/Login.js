import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

function Login() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await authService.login(login, password);
      
      if (data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/employe');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-title">Assistance Tafilalet</div>
        <div className="login-subtitle">Connectez-vous à votre compte</div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Identifiant</label>
            <input
              type="text"
              className="form-input"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              required
              autoFocus
              placeholder="Entrez votre identifiant"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Mot de passe</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Entrez votre mot de passe"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div style={{ marginTop: '2rem', padding: '1rem', background: '#fef2f2', borderRadius: '0.5rem', fontSize: '0.875rem' }}>
          <strong style={{ color: '#dc2626' }}>Comptes de test :</strong>
          <div style={{ marginTop: '0.5rem', color: '#6b7280' }}>
            <div>👤 <strong>Admin</strong> - Login: <strong>admin</strong>, Password: <strong>admin123</strong></div>
            <div style={{ marginTop: '0.25rem' }}>👤 <strong>Employé 1</strong> - Login: <strong>employe1</strong>, Password: <strong>employe1</strong></div>
            <div style={{ marginTop: '0.25rem' }}>👤 <strong>Employé 2</strong> - Login: <strong>employe2</strong>, Password: <strong>employe2</strong></div>
            <div style={{ marginTop: '0.25rem' }}>👤 <strong>Employé 3</strong> - Login: <strong>employe3</strong>, Password: <strong>employe3</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
