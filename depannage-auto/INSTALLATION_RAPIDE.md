# 🚀 Installation Rapide - 5 Minutes

## Étape 1️⃣ : Préparation (30 secondes)

Assurez-vous d'avoir **Node.js** installé :
```bash
node --version
# Doit afficher v14 ou supérieur
```

Si Node.js n'est pas installé, téléchargez-le sur : https://nodejs.org

## Étape 2️⃣ : Backend (2 minutes)

```bash
# Ouvrir un terminal et naviguer vers le dossier backend
cd backend

# Installer les dépendances
npm install

# Initialiser la base de données
npm run init-db

# Démarrer le serveur
npm start
```

✅ Vous devriez voir : "🚀 Serveur démarré sur le port 5000"

**NE PAS FERMER CE TERMINAL**

## Étape 3️⃣ : Frontend (2 minutes)

```bash
# Ouvrir un NOUVEAU terminal et naviguer vers le dossier frontend
cd frontend

# Installer les dépendances
npm install

# Démarrer l'application
npm start
```

✅ Votre navigateur s'ouvre automatiquement sur http://localhost:3000

## Étape 4️⃣ : Connexion (30 secondes)

### Pour tester en tant qu'Administrateur :
- **Login :** admin
- **Mot de passe :** admin123

### Pour tester en tant qu'Employé :
- **Login :** employe
- **Mot de passe :** employe123

---

## 🎉 C'est prêt !

Vous avez maintenant :
- ✅ Un serveur backend opérationnel
- ✅ Une interface frontend moderne
- ✅ Une base de données avec des données de test
- ✅ Deux comptes utilisateurs prêts à l'emploi

## 📝 Que faire ensuite ?

### En tant qu'Employé :
1. Ajoutez une nouvelle mission de dépannage
2. Consultez vos missions récentes

### En tant qu'Admin :
1. Consultez le tableau de bord
2. Gérez les missions (modifier, supprimer)
3. Ajoutez des chauffeurs
4. Consultez les statistiques

## ⚠️ Problèmes ?

### Le backend ne démarre pas
```bash
# Vérifier que le port 5000 est libre
# Sur Windows :
netstat -ano | findstr :5000

# Sur Mac/Linux :
lsof -i :5000
```

### Le frontend ne se connecte pas
1. Vérifiez que le backend tourne (terminal 1)
2. Vérifiez l'URL dans `frontend/.env`
3. Rafraîchissez la page

### Erreur d'installation npm
```bash
# Supprimer node_modules et réinstaller
rm -rf node_modules
npm install
```

## 🔄 Pour redémarrer plus tard

### Backend :
```bash
cd backend
npm start
```

### Frontend :
```bash
cd frontend
npm start
```

---

**Besoin d'aide ?** Consultez le README.md complet pour plus de détails !
