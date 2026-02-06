import React, { useState, useEffect } from 'react';
import { missionService, chauffeurService, employeService, statsService } from '../services/api';
import Navbar from '../components/Navbar';
import MissionModal from '../components/MissionModal';
import ChauffeurModal from '../components/ChauffeurModal';
import EmployeModal from '../components/EmployeModal';
import MissionFilters from '../components/MissionFilters';

function Admin() {
  const [missions, setMissions] = useState([]);
  const [chauffeurs, setChauffeurs] = useState([]);
  const [employes, setEmployes] = useState([]);
  const [stats, setStats] = useState({});
  const [dailyStats, setDailyStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMission, setSelectedMission] = useState(null);
  const [selectedChauffeur, setSelectedChauffeur] = useState(null);
  const [showMissionModal, setShowMissionModal] = useState(false);
  const [showChauffeurModal, setShowChauffeurModal] = useState(false);
  const [showEmployeModal, setShowEmployeModal] = useState(false);
  const [activeTab, setActiveTab] = useState('missions');
  const [filters, setFilters] = useState({
    chauffeur: '',
    employe: '',
    date_debut: '',
    date_fin: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadMissions();
  }, [filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [missionsRes, chauffeursRes, employesRes, statsRes, dailyRes] = await Promise.all([
        missionService.getAll(filters),
        chauffeurService.getAll(),
        employeService.getAll(),
        statsService.getGeneral(),
        statsService.getDaily(),
      ]);
      setMissions(missionsRes.data);
      setChauffeurs(chauffeursRes.data);
      setEmployes(employesRes.data);
      setStats(statsRes.data);
      setDailyStats(dailyRes.data);
    } catch (err) {
      console.error('Erreur lors du chargement des données:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMissions = async () => {
    try {
      const response = await missionService.getAll(filters);
      setMissions(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des missions:', err);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({
      chauffeur: '',
      employe: '',
      date_debut: '',
      date_fin: '',
    });
  };

  const handleDeleteMission = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette mission ?')) {
      try {
        await missionService.delete(id);
        loadData();
      } catch (err) {
        alert('Erreur lors de la suppression');
      }
    }
  };

  const handleDeleteChauffeur = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce chauffeur ?')) {
      try {
        await chauffeurService.delete(id);
        loadData();
      } catch (err) {
        alert('Erreur lors de la suppression');
      }
    }
  };

  const handleDeleteEmploye = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet employé ? Cela n\'affectera pas les missions déjà créées.')) {
      try {
        await employeService.delete(id);
        loadData();
      } catch (err) {
        alert('Erreur lors de la suppression');
      }
    }
  };

  const handleEditMission = (mission) => {
    setSelectedMission(mission);
    setShowMissionModal(true);
  };

  const handleEditChauffeur = (chauffeur) => {
    setSelectedChauffeur(chauffeur);
    setShowChauffeurModal(true);
  };

  const handleAddChauffeur = () => {
    setSelectedChauffeur(null);
    setShowChauffeurModal(true);
  };

  const handleAddEmploye = () => {
    setShowEmployeModal(true);
  };

  if (loading) {
    return (
      <div className="app-container">
        <Navbar />
        <div className="main-content">
          <div className="loading">Chargement des données...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Navbar />
      <div className="main-content">
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem', color: '#111827' }}>
          📊 Tableau de bord - Administration
        </h1>

        {/* Statistiques */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Missions</div>
            <div className="stat-value">{stats.totalMissions || 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Revenu Total</div>
            <div className="stat-value">{parseFloat(stats.totalRevenue || 0).toFixed(2)} MAD</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Revenu Aujourd'hui</div>
            <div className="stat-value">{parseFloat(stats.todayRevenue || 0).toFixed(2)} MAD</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Chauffeurs</div>
            <div className="stat-value">{stats.totalChauffeurs || 0}</div>
          </div>
        </div>

        {/* Revenus par jour */}
        {dailyStats.length > 0 && (
          <div className="card">
            <h2 className="card-title">💰 Revenus par jour</h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyStats.map((stat, index) => (
                    <tr key={index}>
                      <td>{new Date(stat.date_mission).toLocaleDateString('fr-FR')}</td>
                      <td style={{ fontWeight: 'bold', color: '#dc2626' }}>
                        {parseFloat(stat.total).toFixed(2)} MAD
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ marginBottom: '1rem', borderBottom: '2px solid #e5e7eb' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => setActiveTab('missions')}
              style={{
                padding: '1rem 2rem',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'missions' ? '3px solid #dc2626' : '3px solid transparent',
                color: activeTab === 'missions' ? '#dc2626' : '#6b7280',
                fontWeight: activeTab === 'missions' ? 'bold' : 'normal',
                cursor: 'pointer',
                fontSize: '1rem',
              }}
            >
              🚗 Missions ({missions.length})
            </button>
            <button
              onClick={() => setActiveTab('chauffeurs')}
              style={{
                padding: '1rem 2rem',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'chauffeurs' ? '3px solid #dc2626' : '3px solid transparent',
                color: activeTab === 'chauffeurs' ? '#dc2626' : '#6b7280',
                fontWeight: activeTab === 'chauffeurs' ? 'bold' : 'normal',
                cursor: 'pointer',
                fontSize: '1rem',
              }}
            >
              👨‍✈️ Chauffeurs ({chauffeurs.length})
            </button>
            <button
              onClick={() => setActiveTab('employes')}
              style={{
                padding: '1rem 2rem',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'employes' ? '3px solid #dc2626' : '3px solid transparent',
                color: activeTab === 'employes' ? '#dc2626' : '#6b7280',
                fontWeight: activeTab === 'employes' ? 'bold' : 'normal',
                cursor: 'pointer',
                fontSize: '1rem',
              }}
            >
              👤 Employés ({employes.length})
            </button>
          </div>
        </div>

        {/* Contenu des tabs */}
        {activeTab === 'missions' && (
          <>
            <MissionFilters 
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilters}
              chauffeurs={chauffeurs}
              employes={employes}
            />
            
            <div className="card">
              <h2 className="card-title">Toutes les missions ({missions.length})</h2>
              {missions.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">📋</div>
                  <p>Aucune mission trouvée</p>
                </div>
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Date</th>
                        <th>Matricule</th>
                        <th>Marque</th>
                        <th>Trajet</th>
                        <th>Chauffeur</th>
                        <th>Employé</th>
                        <th>Prix</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {missions.map((mission) => (
                        <tr key={mission.id}>
                          <td>#{mission.id}</td>
                          <td>{new Date(mission.date_mission).toLocaleDateString('fr-FR')}</td>
                          <td><strong>{mission.matricule}</strong></td>
                          <td>{mission.marque}</td>
                          <td>{mission.lieu_depart} → {mission.lieu_arrivee}</td>
                          <td>{mission.chauffeur_nom || '-'}</td>
                          <td><strong style={{ color: '#dc2626' }}>{mission.employe_nom || '-'}</strong></td>
                          <td style={{ fontWeight: 'bold', color: '#dc2626' }}>
                            {parseFloat(mission.prix).toFixed(2)} MAD
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button
                                onClick={() => handleEditMission(mission)}
                                className="btn btn-secondary btn-sm"
                              >
                                ✏️ Modifier
                              </button>
                              <button
                                onClick={() => handleDeleteMission(mission.id)}
                                className="btn btn-danger btn-sm"
                              >
                                🗑️ Supprimer
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'chauffeurs' && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 className="card-title" style={{ marginBottom: 0 }}>Gestion des chauffeurs</h2>
              <button
                onClick={handleAddChauffeur}
                className="btn btn-success"
              >
                ➕ Ajouter un chauffeur
              </button>
            </div>
            {chauffeurs.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">👨‍✈️</div>
                <p>Aucun chauffeur enregistré</p>
              </div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nom</th>
                      <th>Téléphone</th>
                      <th>Date d'ajout</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chauffeurs.map((chauffeur) => (
                      <tr key={chauffeur.id}>
                        <td>#{chauffeur.id}</td>
                        <td><strong>{chauffeur.nom}</strong></td>
                        <td>{chauffeur.telephone || '-'}</td>
                        <td>{new Date(chauffeur.created_at).toLocaleDateString('fr-FR')}</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              onClick={() => handleEditChauffeur(chauffeur)}
                              className="btn btn-secondary btn-sm"
                            >
                              ✏️ Modifier
                            </button>
                            <button
                              onClick={() => handleDeleteChauffeur(chauffeur.id)}
                              className="btn btn-danger btn-sm"
                            >
                              🗑️ Supprimer
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'employes' && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 className="card-title" style={{ marginBottom: 0 }}>Gestion des employés</h2>
              <button
                onClick={handleAddEmploye}
                className="btn btn-success"
              >
                ➕ Ajouter un employé
              </button>
            </div>
            {employes.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">👤</div>
                <p>Aucun employé enregistré</p>
              </div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nom complet</th>
                      <th>Login</th>
                      <th>Date de création</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employes.map((employe) => (
                      <tr key={employe.id}>
                        <td>#{employe.id}</td>
                        <td><strong>{employe.nom_complet}</strong></td>
                        <td>{employe.login}</td>
                        <td>{new Date(employe.created_at).toLocaleDateString('fr-FR')}</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              onClick={() => handleDeleteEmploye(employe.id)}
                              className="btn btn-danger btn-sm"
                            >
                              🗑️ Supprimer
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {showMissionModal && (
        <MissionModal
          mission={selectedMission}
          chauffeurs={chauffeurs}
          onClose={() => {
            setShowMissionModal(false);
            setSelectedMission(null);
          }}
          onSave={() => {
            setShowMissionModal(false);
            setSelectedMission(null);
            loadData();
          }}
        />
      )}

      {showChauffeurModal && (
        <ChauffeurModal
          chauffeur={selectedChauffeur}
          onClose={() => {
            setShowChauffeurModal(false);
            setSelectedChauffeur(null);
          }}
          onSave={() => {
            setShowChauffeurModal(false);
            setSelectedChauffeur(null);
            loadData();
          }}
        />
      )}

      {showEmployeModal && (
        <EmployeModal
          onClose={() => {
            setShowEmployeModal(false);
          }}
          onSave={() => {
            setShowEmployeModal(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}

export default Admin;
