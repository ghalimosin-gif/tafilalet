import React, { useState } from 'react';
import { employeService } from '../services/api';

function EmployeModal({ onClose, onSave }) {
  const [formData, setFormData] = useState({
    login: '',
    password: '',
    nom_complet: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await employeService.create(formData);
      onSave();
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la création de l\'employé');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">➕ Ajouter un employé</h2>
          <button onClick={onClose} className="modal-close">×</button>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nom complet *</label>
            <input
              type="text"
              name="nom_complet"
              className="form-input"
              value={formData.nom_complet}
              onChange={handleChange}
              required
              placeholder="Ex: Hassan Bennani"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Login (identifiant) *</label>
            <input
              type="text"
              name="login"
              className="form-input"
              value={formData.login}
              onChange={handleChange}
              required
              placeholder="Ex: hbennani"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Mot de passe *</label>
            <input
              type="password"
              name="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
              placeholder="Minimum 6 caractères"
            />
            <small style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              Minimum 6 caractères
            </small>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Création...' : '➕ Créer l\'employé'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EmployeModal;
