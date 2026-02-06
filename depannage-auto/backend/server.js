require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const db = new sqlite3.Database('./database.sqlite');

// Middleware d'authentification
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token requis' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token invalide' });
    }
    req.user = user;
    next();
  });
};

// Middleware pour vérifier le rôle admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
  }
  next();
};

// Routes d'authentification
app.post('/api/login', (req, res) => {
  const { login, password } = req.body;

  db.get('SELECT * FROM utilisateurs WHERE login = ?', [login], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur serveur' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    bcrypt.compare(password, user.password, (err, isValid) => {
      if (err || !isValid) {
        return res.status(401).json({ error: 'Identifiants invalides' });
      }

      const token = jwt.sign(
        { id: user.id, login: user.login, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          login: user.login,
          role: user.role
        }
      });
    });
  });
});

// Routes pour les missions
app.get('/api/missions', authenticateToken, (req, res) => {
  const { chauffeur, date_debut, date_fin, employe } = req.query;
  
  let query = `
    SELECT m.*, c.nom as chauffeur_nom, u.nom_complet as employe_nom
    FROM missions m 
    LEFT JOIN chauffeurs c ON m.chauffeur_id = c.id 
    LEFT JOIN utilisateurs u ON m.created_by = u.id
    WHERE 1=1
  `;
  
  const params = [];
  
  // Filtre par chauffeur
  if (chauffeur && chauffeur !== '') {
    query += ` AND c.nom LIKE ?`;
    params.push(`%${chauffeur}%`);
  }
  
  // Filtre par date
  if (date_debut && date_debut !== '') {
    query += ` AND m.date_mission >= ?`;
    params.push(date_debut);
  }
  
  if (date_fin && date_fin !== '') {
    query += ` AND m.date_mission <= ?`;
    params.push(date_fin);
  }
  
  // Filtre par employé
  if (employe && employe !== '') {
    query += ` AND u.nom_complet LIKE ?`;
    params.push(`%${employe}%`);
  }
  
  query += ` ORDER BY m.date_mission DESC, m.created_at DESC`;

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors de la récupération des missions' });
    }
    res.json(rows);
  });
});

app.post('/api/missions', authenticateToken, (req, res) => {
  const { matricule, marque, lieu_depart, lieu_arrivee, prix, chauffeur_id } = req.body;

  const query = `
    INSERT INTO missions (matricule, marque, lieu_depart, lieu_arrivee, prix, chauffeur_id, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(
    query,
    [matricule, marque, lieu_depart, lieu_arrivee, prix, chauffeur_id || null, req.user.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Erreur lors de la création de la mission' });
      }

      db.get('SELECT * FROM missions WHERE id = ?', [this.lastID], (err, mission) => {
        if (err) {
          return res.status(500).json({ error: 'Erreur lors de la récupération de la mission' });
        }
        res.status(201).json(mission);
      });
    }
  );
});

app.put('/api/missions/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { matricule, marque, lieu_depart, lieu_arrivee, prix, chauffeur_id } = req.body;

  const query = `
    UPDATE missions 
    SET matricule = ?, marque = ?, lieu_depart = ?, lieu_arrivee = ?, prix = ?, chauffeur_id = ?
    WHERE id = ?
  `;

  db.run(
    query,
    [matricule, marque, lieu_depart, lieu_arrivee, prix, chauffeur_id || null, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Erreur lors de la modification de la mission' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Mission non trouvée' });
      }

      db.get('SELECT * FROM missions WHERE id = ?', [id], (err, mission) => {
        res.json(mission);
      });
    }
  );
});

app.delete('/api/missions/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM missions WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors de la suppression de la mission' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Mission non trouvée' });
    }

    res.json({ message: 'Mission supprimée avec succès' });
  });
});

// Routes pour les statistiques
app.get('/api/stats/daily', authenticateToken, requireAdmin, (req, res) => {
  const query = `
    SELECT date_mission, SUM(prix) as total 
    FROM missions 
    GROUP BY date_mission 
    ORDER BY date_mission DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
    }
    res.json(rows);
  });
});

app.get('/api/stats/general', authenticateToken, requireAdmin, (req, res) => {
  const queries = {
    totalMissions: 'SELECT COUNT(*) as count FROM missions',
    totalRevenue: 'SELECT SUM(prix) as total FROM missions',
    todayRevenue: `SELECT SUM(prix) as total FROM missions WHERE date_mission = date('now')`,
    totalChauffeurs: 'SELECT COUNT(*) as count FROM chauffeurs'
  };

  const stats = {};

  db.get(queries.totalMissions, [], (err, row) => {
    stats.totalMissions = row.count;

    db.get(queries.totalRevenue, [], (err, row) => {
      stats.totalRevenue = row.total || 0;

      db.get(queries.todayRevenue, [], (err, row) => {
        stats.todayRevenue = row.total || 0;

        db.get(queries.totalChauffeurs, [], (err, row) => {
          stats.totalChauffeurs = row.count;
          res.json(stats);
        });
      });
    });
  });
});

// Routes pour les chauffeurs
app.get('/api/chauffeurs', authenticateToken, (req, res) => {
  db.all('SELECT * FROM chauffeurs ORDER BY nom', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors de la récupération des chauffeurs' });
    }
    res.json(rows);
  });
});

// Route pour récupérer tous les employés
app.get('/api/employes', authenticateToken, requireAdmin, (req, res) => {
  db.all('SELECT id, login, nom_complet, created_at FROM utilisateurs WHERE role = ? ORDER BY nom_complet', ['employe'], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors de la récupération des employés' });
    }
    res.json(rows);
  });
});

// Route pour créer un employé (admin uniquement)
app.post('/api/employes', authenticateToken, requireAdmin, async (req, res) => {
  const { login, password, nom_complet } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    db.run(
      'INSERT INTO utilisateurs (login, password, nom_complet, role) VALUES (?, ?, ?, ?)',
      [login, hashedPassword, nom_complet, 'employe'],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return res.status(400).json({ error: 'Ce login existe déjà' });
          }
          return res.status(500).json({ error: 'Erreur lors de la création de l\'employé' });
        }

        db.get('SELECT id, login, nom_complet, created_at FROM utilisateurs WHERE id = ?', [this.lastID], (err, employe) => {
          res.status(201).json(employe);
        });
      }
    );
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors du cryptage du mot de passe' });
  }
});

// Route pour supprimer un employé
app.delete('/api/employes/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM utilisateurs WHERE id = ? AND role = ?', [id, 'employe'], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors de la suppression de l\'employé' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Employé non trouvé' });
    }

    res.json({ message: 'Employé supprimé avec succès' });
  });
});

app.post('/api/chauffeurs', authenticateToken, requireAdmin, (req, res) => {
  const { nom, telephone } = req.body;

  db.run(
    'INSERT INTO chauffeurs (nom, telephone) VALUES (?, ?)',
    [nom, telephone],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Erreur lors de la création du chauffeur' });
      }

      db.get('SELECT * FROM chauffeurs WHERE id = ?', [this.lastID], (err, chauffeur) => {
        res.status(201).json(chauffeur);
      });
    }
  );
});

app.put('/api/chauffeurs/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { nom, telephone } = req.body;

  db.run(
    'UPDATE chauffeurs SET nom = ?, telephone = ? WHERE id = ?',
    [nom, telephone, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Erreur lors de la modification du chauffeur' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Chauffeur non trouvé' });
      }

      db.get('SELECT * FROM chauffeurs WHERE id = ?', [id], (err, chauffeur) => {
        res.json(chauffeur);
      });
    }
  );
});

app.delete('/api/chauffeurs/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM chauffeurs WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors de la suppression du chauffeur' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Chauffeur non trouvé' });
    }

    res.json({ message: 'Chauffeur supprimé avec succès' });
  });
});

// Route de test
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Serveur opérationnel' });
});

app.listen(PORT, () => {// DEBUG: voir les utilisateurs (temporaire)
app.get('/api/debug-users', (req, res) => {
  db.all("SELECT id, login, role FROM utilisateurs", [], (err, rows) => {
    if (err) return res.json(err);
    res.json(rows);
  });
});
