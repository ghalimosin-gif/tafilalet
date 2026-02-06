import React, { useState } from 'react';
import { chauffeurService } from '../services/api';

function ChauffeurModal({ chauffeur, onClose, onSave }) {
  const [formData, setFormData] = useState({
    nom: chauffeur?.nom || '',
    telephone: chauffeur?.telephone || '',
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
      if (chauffeur) {
        await chauffeurService.update(chauffeur.id, formData);
      } else {
        await chauffeurService.create(formData);
      }
      onSave();
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {chauffeur ? `Modifier ${chauffeur.nom}` : 'Ajouter un chauffeur'}
          </h2>
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
              name="nom"
              className="form-input"
              value={formData.nom}
              onChange={handleChange}
              required
              placeholder="Ex: Mohamed Alami"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Téléphone</label>
            <input
              type="tel"
              name="telephone"
              className="form-input"
              value={formData.telephone}
              onChange={handleChange}
              placeholder="Ex: 0612345678"
            />
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Enregistrement...' : chauffeur ? 'Modifier' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChauffeurModal;
