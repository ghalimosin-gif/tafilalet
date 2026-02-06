const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.sqlite');

console.log('📝 Ajout de données de test supplémentaires...\n');

db.serialize(() => {
  // Ajouter plus de chauffeurs
  const chauffeurs = [
    ['Youssef Benjelloun', '0645678901'],
    ['Amina Tahiri', '0656789012'],
    ['Karim Moussaoui', '0667890123'],
    ['Nadia Chraibi', '0678901234'],
    ['Rachid Idrissi', '0689012345']
  ];

  const stmtChauffeur = db.prepare('INSERT INTO chauffeurs (nom, telephone) VALUES (?, ?)');
  chauffeurs.forEach(chauffeur => {
    stmtChauffeur.run(chauffeur);
  });
  stmtChauffeur.finalize();

  // Ajouter plus de missions
  const missions = [
    ['XYZ-7890', 'Toyota', 'Casablanca', 'El Jadida', 280.00, 4, '2024-02-04'],
    ['LMN-2345', 'Volkswagen', 'Rabat', 'Salé', 150.00, 5, '2024-02-04'],
    ['OPQ-6789', 'Seat', 'Agadir', 'Essaouira', 320.00, 6, '2024-02-05'],
    ['RST-1234', 'Fiat', 'Marrakech', 'Ouarzazate', 550.00, 4, '2024-02-05'],
    ['UVW-5678', 'Hyundai', 'Tanger', 'Chefchaouen', 380.00, 7, '2024-02-06'],
    ['AAA-9999', 'Kia', 'Fès', 'Ifrane', 290.00, 5, '2024-02-06'],
    ['BBB-8888', 'Nissan', 'Casablanca', 'Marrakech', 480.00, 8, '2024-02-06'],
    ['CCC-7777', 'Mazda', 'Rabat', 'Kenitra', 220.00, 6, '2024-02-07'],
    ['DDD-6666', 'Ford', 'Agadir', 'Tiznit', 270.00, 7, '2024-02-07'],
    ['EEE-5555', 'Opel', 'Tanger', 'Asilah', 190.00, 4, '2024-02-07']
  ];

  const stmtMission = db.prepare(`
    INSERT INTO missions 
    (matricule, marque, lieu_depart, lieu_arrivee, prix, chauffeur_id, date_mission) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  missions.forEach(mission => {
    stmtMission.run(mission);
  });
  stmtMission.finalize();
});

db.close(() => {
  console.log('✅ Données supplémentaires ajoutées avec succès!\n');
  console.log('📊 Nouvelles données:');
  console.log('   - 5 chauffeurs supplémentaires');
  console.log('   - 10 missions supplémentaires');
  console.log('\n💡 Relancez le serveur pour voir les changements!');
});
