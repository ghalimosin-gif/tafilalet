import React from 'react';

function MissionFilters({ filters, onFilterChange, onReset, chauffeurs, employes }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ ...filters, [name]: value });
  };

  return (
    <div className="card" style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>
          🔍 Recherche et Filtres
        </h3>
        <button onClick={onReset} className="btn btn-secondary btn-sm">
          ↻ Réinitialiser
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {/* Filtre par chauffeur */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Chauffeur</label>
          <input
            type="text"
            name="chauffeur"
            className="form-input"
            value={filters.chauffeur || ''}
            onChange={handleChange}
            placeholder="Nom du chauffeur..."
          />
        </div>

        {/* Filtre par employé */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Employé</label>
          <input
            type="text"
            name="employe"
            className="form-input"
            value={filters.employe || ''}
            onChange={handleChange}
            placeholder="Nom de l'employé..."
          />
        </div>

        {/* Filtre date début */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Date début</label>
          <input
            type="date"
            name="date_debut"
            className="form-input"
            value={filters.date_debut || ''}
            onChange={handleChange}
          />
        </div>

        {/* Filtre date fin */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Date fin</label>
          <input
            type="date"
            name="date_fin"
            className="form-input"
            value={filters.date_fin || ''}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Indicateur de résultats */}
      {(filters.chauffeur || filters.employe || filters.date_debut || filters.date_fin) && (
        <div style={{ 
          marginTop: '1rem', 
          padding: '0.75rem', 
          background: '#fef2f2', 
          borderRadius: '0.5rem',
          border: '1px solid #fecaca',
          fontSize: '0.875rem',
          color: '#991b1b'
        }}>
          <strong>Filtres actifs :</strong>
          {filters.chauffeur && ` Chauffeur: "${filters.chauffeur}"`}
          {filters.employe && ` | Employé: "${filters.employe}"`}
          {filters.date_debut && ` | Du: ${new Date(filters.date_debut).toLocaleDateString('fr-FR')}`}
          {filters.date_fin && ` | Au: ${new Date(filters.date_fin).toLocaleDateString('fr-FR')}`}
        </div>
      )}
    </div>
  );
}

export default MissionFilters;
