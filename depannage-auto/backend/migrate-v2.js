const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

console.log('🔄 Migration de la base de données vers la version 2.0...\n');

const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
  // Vérifier si la colonne nom_complet existe déjà
  db.all("PRAGMA table_info(utilisateurs)", (err, columns) => {
    const hasNomComplet = columns.some(col => col.name === 'nom_complet');
    
    if (!hasNomComplet) {
      console.log('📝 Ajout de la colonne nom_complet...');
      
      // Ajouter la colonne nom_complet
      db.run("ALTER TABLE utilisateurs ADD COLUMN nom_complet TEXT DEFAULT 'Employé'", (err) => {
        if (err) {
          console.error('❌ Erreur lors de l\'ajout de la colonne:', err);
          return;
        }
        
        console.log('✅ Colonne nom_complet ajoutée');
        
        // Mettre à jour les utilisateurs existants
        db.run("UPDATE utilisateurs SET nom_complet = 'Administrateur Principal' WHERE role = 'admin'");
        db.run("UPDATE utilisateurs SET nom_complet = 'Employé Ancien' WHERE role = 'employe' AND nom_complet = 'Employé'");
        
        // Ajouter les nouveaux employés
        const employe1Password = bcrypt.hashSync('employe1', 10);
        const employe2Password = bcrypt.hashSync('employe2', 10);
        const employe3Password = bcrypt.hashSync('employe3', 10);

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
        `, [employe3Password], () => {
          console.log('✅ Nouveaux employés ajoutés');
          console.log('\n📝 Comptes disponibles:');
          console.log('   Admin - Login: admin, Password: admin123');
          console.log('   Employé 1 - Login: employe1, Password: employe1 (Hassan Bennani)');
          console.log('   Employé 2 - Login: employe2, Password: employe2 (Samira Alaoui)');
          console.log('   Employé 3 - Login: employe3, Password: employe3 (Omar Tazi)');
          console.log('\n✅ Migration terminée avec succès!');
          console.log('💡 Redémarrez le serveur pour que les changements prennent effet.');
          
          db.close();
        });
      });
    } else {
      console.log('ℹ️  La colonne nom_complet existe déjà');
      console.log('✅ Aucune migration nécessaire');
      db.close();
    }
  });
});
