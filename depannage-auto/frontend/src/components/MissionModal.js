import React, { useState } from 'react';
import { missionService } from '../services/api';

function MissionModal({ mission, chauffeurs, onClose, onSave }) {
  const [formData, setFormData] = useState({
    matricule: mission?.matricule || '',
    marque: mission?.marque || '',
    lieu_depart: mission?.lieu_depart || '',
    lieu_arrivee: mission?.lieu_arrivee || '',
    prix: mission?.prix || '',
    chauffeur_id: mission?.chauffeur_id || '',
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
      await missionService.update(mission.id, formData);
      onSave();
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la modification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Modifier la mission #{mission?.id}</h2>
          <button onClick={onClose} className="modal-close">×</button>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Matricule</label>
              <input
                type="text"
                name="matricule"
                className="form-input"
                value={formData.matricule}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Marque</label>
              <input
                type="text"
                name="marque"
                className="form-input"
                value={formData.marque}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Lieu de départ</label>
              <input
                type="text"
                name="lieu_depart"
                className="form-input"
                value={formData.lieu_depart}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Lieu d'arrivée</label>
              <input
                type="text"
                name="lieu_arrivee"
                className="form-input"
                value={formData.lieu_arrivee}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Prix (MAD)</label>
              <input
                type="number"
                name="prix"
                className="form-input"
                value={formData.prix}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Chauffeur</label>
              <select
                name="chauffeur_id"
                className="form-select"
                value={formData.chauffeur_id}
                onChange={handleChange}
              >
                <option value="">Aucun chauffeur</option>
                {chauffeurs.map((chauffeur) => (
                  <option key={chauffeur.id} value={chauffeur.id}>
                    {chauffeur.nom}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MissionModal;
