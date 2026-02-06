import React, { useState, useEffect } from 'react';
import { missionService, chauffeurService } from '../services/api';
import Navbar from '../components/Navbar';

function Employe() {
  const [formData, setFormData] = useState({
    matricule: '',
    marque: '',
    lieu_depart: '',
    lieu_arrivee: '',
    prix: '',
    chauffeur_id: '',
  });
  const [chauffeurs, setChauffeurs] = useState([]);
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadChauffeurs();
    loadMissions();
  }, []);

  const loadChauffeurs = async () => {
    try {
      const response = await chauffeurService.getAll();
      setChauffeurs(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des chauffeurs:', err);
    }
  };

  const loadMissions = async () => {
    try {
      const response = await missionService.getAll();
      setMissions(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des missions:', err);
    }
  };

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
    setSuccess('');

    try {
      await missionService.create(formData);
      setSuccess('Mission enregistrée avec succès !');
      setFormData({
        matricule: '',
        marque: '',
        lieu_depart: '',
        lieu_arrivee: '',
        prix: '',
        chauffeur_id: '',
      });
      loadMissions();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Navbar />
      <div className="main-content">
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem', color: '#111827' }}>
          📋 Nouvelle Mission de Dépannage
        </h1>

        {success && (
          <div className="alert alert-success">
            ✅ {success}
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            ❌ {error}
          </div>
        )}

        <div className="card">
          <h2 className="card-title">Informations de la mission</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">Matricule du véhicule *</label>
                <input
                  type="text"
                  name="matricule"
                  className="form-input"
                  value={formData.matricule}
                  onChange={handleChange}
                  required
                  placeholder="Ex: ABC-1234"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Marque *</label>
                <input
                  type="text"
                  name="marque"
                  className="form-input"
                  value={formData.marque}
                  onChange={handleChange}
                  required
                  placeholder="Ex: Renault, Peugeot..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Lieu de départ *</label>
                <input
                  type="text"
                  name="lieu_depart"
                  className="form-input"
                  value={formData.lieu_depart}
                  onChange={handleChange}
                  required
                  placeholder="Ex: Casablanca"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Lieu d'arrivée *</label>
                <input
                  type="text"
                  name="lieu_arrivee"
                  className="form-input"
                  value={formData.lieu_arrivee}
                  onChange={handleChange}
                  required
                  placeholder="Ex: Rabat"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Prix (MAD) *</label>
                <input
                  type="number"
                  name="prix"
                  className="form-input"
                  value={formData.prix}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="Ex: 350.00"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Chauffeur (optionnel)</label>
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

            <div style={{ marginTop: '1.5rem' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Enregistrement...' : '💾 Enregistrer la mission'}
              </button>
            </div>
          </form>
        </div>

        <div className="card">
          <h2 className="card-title">Mes missions récentes</h2>
          {missions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <p>Aucune mission enregistrée</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Matricule</th>
                    <th>Marque</th>
                    <th>Trajet</th>
                    <th>Chauffeur</th>
                    <th>Prix</th>
                  </tr>
                </thead>
                <tbody>
                  {missions.slice(0, 10).map((mission) => (
                    <tr key={mission.id}>
                      <td>{new Date(mission.date_mission).toLocaleDateString('fr-FR')}</td>
                      <td><strong>{mission.matricule}</strong></td>
                      <td>{mission.marque}</td>
                      <td>{mission.lieu_depart} → {mission.lieu_arrivee}</td>
                      <td>{mission.chauffeur_nom || '-'}</td>
                      <td style={{ fontWeight: 'bold', color: '#dc2626' }}>
                        {parseFloat(mission.prix).toFixed(2)} MAD
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Employe;
