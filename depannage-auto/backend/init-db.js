const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const db = new sqlite3.Database('./database.sqlite');

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

  // Créer un admin et plusieurs employés par défaut
  const adminPassword = bcrypt.hashSync('admin123', 10);
  const employe1Password = bcrypt.hashSync('employe1', 10);
  const employe2Password = bcrypt.hashSync('employe2', 10);
  const employe3Password = bcrypt.hashSync('employe3', 10);

  db.run(`
    INSERT OR IGNORE INTO utilisateurs (login, password, nom_complet, role) 
    VALUES ('admin', ?, 'Administrateur Principal', 'admin')
  `, [adminPassword]);

  db.run(`
    INSERT OR IGNORE INTO utilisateurs (login, password, nom_complet, role) 
    VALUES ('employe1', ?, 'Hassan Bennani', 'employe')
  `, [employe1Password]);

  db.run(`
    INSERT OR IGNORE INTO utilisateurs (login, password, nom_complet, role) 
    VALUES ('employe2', ?, 'Samira Alaoui', 'employe')
  `, [employe2Password]);

  db.run(`
    INSERT OR IGNORE INTO utilisateurs (login, password, nom_complet, role) 
    VALUES ('employe3', ?, 'Omar Tazi', 'employe')
  `, [employe3Password]);

  // Créer quelques chauffeurs de test
  db.run(`INSERT OR IGNORE INTO chauffeurs (id, nom, telephone) VALUES (1, 'Mohamed Alami', '0612345678')`);
  db.run(`INSERT OR IGNORE INTO chauffeurs (id, nom, telephone) VALUES (2, 'Fatima Bennani', '0623456789')`);
  db.run(`INSERT OR IGNORE INTO chauffeurs (id, nom, telephone) VALUES (3, 'Ahmed Tazi', '0634567890')`);

  // Créer quelques missions de test
  const missions = [
    ['ABC-1234', 'Renault', 'Casablanca', 'Rabat', 350.00, 1, '2024-02-05'],
    ['DEF-5678', 'Peugeot', 'Marrakech', 'Agadir', 450.00, 2, '2024-02-05'],
    ['GHI-9012', 'Dacia', 'Fès', 'Meknès', 200.00, 1, '2024-02-06'],
    ['JKL-3456', 'Mercedes', 'Tanger', 'Tétouan', 300.00, 3, '2024-02-06']
  ];

  const stmt = db.prepare(`
    INSERT OR IGNORE INTO missions 
    (matricule, marque, lieu_depart, lieu_arrivee, prix, chauffeur_id, date_mission) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  missions.forEach(mission => {
    stmt.run(mission);
  });

  stmt.finalize();
});

db.close(() => {
  console.log('✅ Base de données initialisée avec succès!');
  console.log('\n📝 Comptes créés:');
  console.log('   Admin - Login: admin, Password: admin123');
  console.log('   Employé 1 - Login: employe1, Password: employe1 (Hassan Bennani)');
  console.log('   Employé 2 - Login: employe2, Password: employe2 (Samira Alaoui)');
  console.log('   Employé 3 - Login: employe3, Password: employe3 (Omar Tazi)');
});
