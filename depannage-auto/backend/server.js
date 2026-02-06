require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_jwt_tres_securise_changez_moi_en_production';

// ✅ CORRECTION 1: Configuration CORS améliorée pour Render
app.use(cors({
  origin: '*', // En production, remplacez par l'URL exacte de votre frontend
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// ✅ CORRECTION 2: Gestion de la base de données
const dbPath = path.join(__dirname, 'database.sqlite');
console.log('📁 Chemin de la base de données:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Erreur de connexion à la base de données:', err);
  } else {
    console.log('✅ Connexion à la base de données réussie');
  }
});

// ✅ CORRECTION 3: Initialiser la base de données si elle n'existe pas
db.serialize(() => {
  // Table utilisateurs
  db.run(`
    CREATE TABLE IF NOT EXISTS utilisateurs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      login TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      nom_complet TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('employe', 'admin')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Table chauffeurs
  db.run(`
    CREATE TABLE IF NOT EXISTS chauffeurs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nom TEXT NOT NULL,
      telephone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Table missions
  db.run(`
    CREATE TABLE IF NOT EXISTS missions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      matricule TEXT NOT NULL,
      marque TEXT NOT NULL,
      lieu_depart TEXT NOT NULL,
      lieu_arrivee TEXT NOT NULL,
      prix DECIMAL(10, 2) NOT NULL,
      chauffeur_id INTEGER,
      date_mission DATE DEFAULT (date('now')),
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (chauffeur_id) REFERENCES chauffeurs(id),
      FOREIGN KEY (created_by) REFERENCES utilisateurs(id)
    )
  `);

  // Créer l'admin par défaut
  db.get('SELECT * FROM utilisateurs WHERE login = ?', ['admin'], async (err, user) => {
    if (!user) {
      const adminPassword = bcrypt.hashSync('admin123', 10);
      db.run(`
        INSERT INTO utilisateurs (login, password, nom_complet, role) 
        VALUES ('admin', ?, 'Administrateur Principal', 'admin')
      `, [adminPassword], () => {
        console.log('✅ Compte admin créé: admin / admin123');
      });
    }
  });

  // Créer les employés par défaut
  const employes = [
    ['employe1', 'employe1', 'Hassan Bennani'],
    ['employe2', 'employe2', 'Samira Alaoui'],
    ['employe3', 'employe3', 'Omar Tazi']
  ];

  employes.forEach(([login, password, nom]) => {
    db.get('SELECT * FROM utilisateurs WHERE login = ?', [login], (err, user) => {
      if (!user) {
        const hashedPassword = bcrypt.hashSync(password, 10);
        db.run(`
          INSERT INTO utilisateurs (login, password, nom_complet, role) 
          VALUES (?, ?, ?, 'employe')
        `, [login, hashedPassword, nom], () => {
          console.log(`✅ Compte employé créé: ${login} / ${password}`);
        });
      }
    });
  });

  // Créer quelques chauffeurs de test
  db.get('SELECT COUNT(*) as count FROM chauffeurs', [], (err, result) => {
    if (result && result.count === 0) {
      const chauffeurs = [
        ['Mohamed Alami', '0612345678'],
        ['Fatima Bennani', '0623456789'],
        ['Ahmed Tazi', '0634567890']
      ];
      
      const stmt = db.prepare('INSERT INTO chauffeurs (nom, telephone) VALUES (?, ?)');
      chauffeurs.forEach(chauffeur => stmt.run(chauffeur));
      stmt.finalize(() => {
        console.log('✅ Chauffeurs de test créés');
      });
    }
  });
});

// Middleware d'authentification
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token requis' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.log('❌ Token invalide:', err.message);
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

// =====================================
// ROUTES D'AUTHENTIFICATION
// =====================================

// ✅ CORRECTION 4: Route de login améliorée avec logs
app.post('/api/login', (req, res) => {
  const { login, password } = req.body;

  console.log('🔐 Tentative de connexion pour:', login);

  if (!login || !password) {
    console.log('❌ Login ou mot de passe manquant');
    return res.status(400).json({ error: 'Identifiant et mot de passe requis' });
  }

  db.get('SELECT * FROM utilisateurs WHERE login = ?', [login], (err, user) => {
    if (err) {
      console.error('❌ Erreur DB:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }

    if (!user) {
      console.log('❌ Utilisateur non trouvé:', login);
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    bcrypt.compare(password, user.password, (err, isValid) => {
      if (err) {
        console.error('❌ Erreur bcrypt:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
      }

      if (!isValid) {
        console.log('❌ Mot de passe incorrect pour:', login);
        return res.status(401).json({ error: 'Identifiants invalides' });
      }

      const token = jwt.sign(
        { id: user.id, login: user.login, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      console.log('✅ Connexion réussie pour:', login, '- Role:', user.role);

      res.json({
        token,
        user: {
          id: user.id,
          login: user.login,
          role: user.role,
          nom_complet: user.nom_complet
        }
      });
    });
  });
});

// ⚠️ ROUTE DEBUG - À SUPPRIMER EN PRODUCTION
app.get('/api/debug-users', (req, res) => {
  db.all('SELECT id, login, role, nom_complet FROM utilisateurs', [], (err, users) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    res.json(users);
  });
});

// =====================================
// ROUTES MISSIONS
// =====================================

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
  
  if (chauffeur && chauffeur !== '') {
    query += ` AND c.nom LIKE ?`;
    params.push(`%${chauffeur}%`);
  }
  
  if (date_debut && date_debut !== '') {
    query += ` AND m.date_mission >= ?`;
    params.push(date_debut);
  }
  
  if (date_fin && date_fin !== '') {
    query += ` AND m.date_mission <= ?`;
    params.push(date_fin);
  }
  
  if (employe && employe !== '') {
    query += ` AND u.nom_complet LIKE ?`;
    params.push(`%${employe}%`);
  }
  
  query += ` ORDER BY m.date_mission DESC, m.created_at DESC`;

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('❌ Erreur missions:', err);
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
        console.error('❌ Erreur création mission:', err);
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

// =====================================
// ROUTES STATISTIQUES
// =====================================

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

// =====================================
// ROUTES CHAUFFEURS
// =====================================

app.get('/api/chauffeurs', authenticateToken, (req, res) => {
  db.all('SELECT * FROM chauffeurs ORDER BY nom', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors de la récupération des chauffeurs' });
    }
    res.json(rows);
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

// =====================================
// ROUTES EMPLOYÉS
// =====================================

app.get('/api/employes', authenticateToken, requireAdmin, (req, res) => {
  db.all('SELECT id, login, nom_complet, created_at FROM utilisateurs WHERE role = ? ORDER BY nom_complet', ['employe'], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors de la récupération des employés' });
    }
    res.json(rows);
  });
});

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

// =====================================
// ROUTES DE TEST ET SANTÉ
// =====================================

app.get('/', (req, res) => {
  res.json({ 
    message: '✅ API Assistance Tafilalet - Backend opérationnel',
    version: '2.0',
    endpoints: {
      login: 'POST /api/login',
      missions: 'GET /api/missions',
      chauffeurs: 'GET /api/chauffeurs',
      employes: 'GET /api/employes',
      health: 'GET /api/health'
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date(),
    database: 'SQLite connecté',
    jwt: JWT_SECRET ? 'Configuré' : 'Non configuré'
  });
});

// =====================================
// DÉMARRAGE DU SERVEUR
// =====================================

app.listen(PORT, () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 Serveur Assistance Tafilalet démarré');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📡 Port: ${PORT}`);
  console.log(`🔐 JWT Secret: ${JWT_SECRET ? 'Configuré ✅' : 'Non configuré ❌'}`);
  console.log(`🗄️  Base de données: SQLite`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 Comptes disponibles:');
  console.log('   👤 Admin - login: admin, password: admin123');
  console.log('   👤 Employé 1 - login: employe1, password: employe1');
  console.log('   👤 Employé 2 - login: employe2, password: employe2');
  console.log('   👤 Employé 3 - login: employe3, password: employe3');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

// Gestion des erreurs non capturées
process.on('unhandledRejection', (err) => {
  console.error('❌ Erreur non gérée:', err);
});

process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('❌ Erreur fermeture DB:', err);
    } else {
      console.log('\n✅ Base de données fermée proprement');
    }
    process.exit(0);
  });
});
