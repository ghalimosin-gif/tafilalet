# 🚗 Système de Gestion de Dépannage Automobile

Application web complète pour la gestion des missions de dépannage automobile avec authentification, gestion des rôles, et tableau de bord administrateur.

## 📋 Fonctionnalités

### 🔐 Authentification
- Connexion sécurisée avec login et mot de passe
- Mots de passe cryptés (bcrypt)
- Tokens JWT pour les sessions
- Deux types d'utilisateurs : **Employé** et **Administrateur**
- Redirection automatique selon le rôle

### 👨‍💼 Interface Employé
- ➕ Ajouter une mission de dépannage avec :
  - Matricule du véhicule
  - Marque
  - Lieu de départ
  - Lieu d'arrivée
  - Prix
  - Chauffeur (optionnel)
- 📋 Voir les 10 dernières missions
- 💾 Enregistrement automatique dans la base de données

### 🎯 Interface Administrateur
- 📊 Tableau de bord avec statistiques :
  - Total des missions
  - Revenu total
  - Revenu du jour
  - Nombre de chauffeurs
- 💰 Statistiques des revenus par jour
- ✏️ Modification des missions
- 🗑️ Suppression des missions
- 👥 Gestion complète des chauffeurs (ajout, modification, suppression)

### 🎨 Design
- Thème principal **rouge** moderne et professionnel
- Interface responsive (mobile, tablette, desktop)
- Animations et transitions fluides
- UX optimisée

## 🛠️ Technologies Utilisées

### Backend
- **Node.js** avec Express
- **SQLite** (base de données)
- **bcryptjs** (cryptage des mots de passe)
- **jsonwebtoken** (authentification JWT)
- **CORS** activé

### Frontend
- **React** 18
- **React Router** (navigation)
- **Axios** (requêtes HTTP)
- **CSS** personnalisé (pas de framework externe)

## 📦 Structure du Projet

```
depannage-auto/
├── backend/
│   ├── server.js           # Serveur Express principal
│   ├── init-db.js          # Script d'initialisation de la DB
│   ├── package.json
│   ├── .env                # Variables d'environnement
│   └── database.sqlite     # Base de données (créée automatiquement)
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.js
    │   │   ├── PrivateRoute.js
    │   │   ├── MissionModal.js
    │   │   └── ChauffeurModal.js
    │   ├── pages/
    │   │   ├── Login.js
    │   │   ├── Admin.js
    │   │   └── Employe.js
    │   ├── services/
    │   │   └── api.js
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    ├── package.json
    └── .env
```

## 🚀 Installation et Démarrage

### Prérequis
- **Node.js** version 14 ou supérieure
- **npm** (installé avec Node.js)

### Étape 1 : Installation du Backend

```bash
# Aller dans le dossier backend
cd backend

# Installer les dépendances
npm install

# Initialiser la base de données avec les données de test
npm run init-db

# Démarrer le serveur
npm start
```

Le serveur backend démarre sur **http://localhost:5000**

### Étape 2 : Installation du Frontend

Dans un **nouveau terminal** :

```bash
# Aller dans le dossier frontend
cd frontend

# Installer les dépendances
npm install

# Démarrer l'application React
npm start
```

L'application frontend s'ouvre automatiquement sur **http://localhost:3000**

## 👤 Comptes de Test

### Administrateur
- **Login :** `admin`
- **Mot de passe :** `admin123`

### Employé
- **Login :** `employe`
- **Mot de passe :** `employe123`

## 📊 Base de Données

### Structure des Tables

#### Table `utilisateurs`
```sql
- id (INTEGER, PRIMARY KEY)
- login (TEXT, UNIQUE)
- password (TEXT, crypté)
- role (TEXT: 'employe' ou 'admin')
- created_at (DATETIME)
```

#### Table `chauffeurs`
```sql
- id (INTEGER, PRIMARY KEY)
- nom (TEXT)
- telephone (TEXT)
- created_at (DATETIME)
```

#### Table `missions`
```sql
- id (INTEGER, PRIMARY KEY)
- matricule (TEXT)
- marque (TEXT)
- lieu_depart (TEXT)
- lieu_arrivee (TEXT)
- prix (DECIMAL)
- chauffeur_id (INTEGER, FK)
- date_mission (DATE)
- created_by (INTEGER, FK)
- created_at (DATETIME)
```

## 🔒 Sécurité

- ✅ Mots de passe cryptés avec bcrypt (10 rounds)
- ✅ Authentification par JWT
- ✅ Protection des routes selon les rôles
- ✅ Validation des tokens à chaque requête
- ✅ Déconnexion automatique si token invalide
- ✅ Protection CORS configurée

## 🌐 API Endpoints

### Authentification
- `POST /api/login` - Connexion

### Missions
- `GET /api/missions` - Liste des missions (authentifié)
- `POST /api/missions` - Créer une mission (authentifié)
- `PUT /api/missions/:id` - Modifier une mission (admin)
- `DELETE /api/missions/:id` - Supprimer une mission (admin)

### Chauffeurs
- `GET /api/chauffeurs` - Liste des chauffeurs (authentifié)
- `POST /api/chauffeurs` - Créer un chauffeur (admin)
- `PUT /api/chauffeurs/:id` - Modifier un chauffeur (admin)
- `DELETE /api/chauffeurs/:id` - Supprimer un chauffeur (admin)

### Statistiques
- `GET /api/stats/daily` - Revenus par jour (admin)
- `GET /api/stats/general` - Statistiques générales (admin)

## 🎯 Utilisation

### Pour un Employé
1. Se connecter avec les identifiants employé
2. Remplir le formulaire de mission
3. Sélectionner un chauffeur (optionnel)
4. Cliquer sur "Enregistrer la mission"
5. La mission est ajoutée instantanément

### Pour un Administrateur
1. Se connecter avec les identifiants admin
2. Consulter les statistiques du tableau de bord
3. Gérer les missions (modifier, supprimer)
4. Gérer les chauffeurs (ajouter, modifier, supprimer)
5. Voir les revenus par jour

## 📱 Responsive Design

L'application est entièrement responsive et fonctionne sur :
- 💻 Desktop (1400px+)
- 📱 Tablette (768px - 1400px)
- 📱 Mobile (< 768px)

## 🚀 Déploiement

### Option 1 : Render (Gratuit)

#### Backend sur Render

1. Créer un compte sur [Render.com](https://render.com)
2. Créer un nouveau **Web Service**
3. Connecter votre dépôt GitHub
4. Configuration :
   - **Build Command :** `cd backend && npm install`
   - **Start Command :** `cd backend && npm start`
   - **Environment Variables :**
     ```
     PORT=5000
     JWT_SECRET=votre_secret_jwt_production
     NODE_ENV=production
     ```

#### Frontend sur Render

1. Créer un nouveau **Static Site**
2. Configuration :
   - **Build Command :** `cd frontend && npm install && npm run build`
   - **Publish Directory :** `frontend/build`
   - **Environment Variables :**
     ```
     REACT_APP_API_URL=https://votre-backend.onrender.com/api
     ```

### Option 2 : Vercel (Frontend) + Render (Backend)

#### Backend sur Render (même qu'au-dessus)

#### Frontend sur Vercel

1. Installer Vercel CLI : `npm i -g vercel`
2. Aller dans le dossier frontend : `cd frontend`
3. Déployer : `vercel`
4. Configurer l'environnement :
   ```
   REACT_APP_API_URL=https://votre-backend.onrender.com/api
   ```

### Option 3 : Heroku

#### Backend

```bash
cd backend
heroku create votre-app-backend
heroku config:set JWT_SECRET=votre_secret_jwt_production
git push heroku main
```

#### Frontend

```bash
cd frontend
heroku create votre-app-frontend
heroku config:set REACT_APP_API_URL=https://votre-app-backend.herokuapp.com/api
git push heroku main
```

### Migration vers PostgreSQL (Production)

Pour la production, il est recommandé de migrer de SQLite vers PostgreSQL :

1. Installer PostgreSQL : `npm install pg`
2. Modifier la connexion dans `server.js`
3. Utiliser une base PostgreSQL (Render, Heroku, etc.)

## 🔧 Configuration Avancée

### Variables d'Environnement Backend (.env)

```env
PORT=5000
JWT_SECRET=changez_ce_secret_en_production
NODE_ENV=development
DATABASE_URL=sqlite:./database.sqlite  # Ou PostgreSQL en production
```

### Variables d'Environnement Frontend (.env)

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 📝 Scripts Disponibles

### Backend

```bash
npm start        # Démarrer le serveur
npm run dev      # Démarrer avec nodemon (auto-reload)
npm run init-db  # Initialiser/réinitialiser la base de données
```

### Frontend

```bash
npm start        # Démarrer en mode développement
npm run build    # Créer une version de production
npm test         # Lancer les tests
```

## 🐛 Résolution de Problèmes

### Le backend ne démarre pas
- Vérifier que Node.js est installé : `node --version`
- Vérifier que le port 5000 est libre
- Réinstaller les dépendances : `rm -rf node_modules && npm install`

### Le frontend ne se connecte pas au backend
- Vérifier que le backend est démarré
- Vérifier l'URL dans `.env` du frontend
- Vérifier la console navigateur pour les erreurs CORS

### Erreur "Token invalide"
- Se déconnecter et se reconnecter
- Vider le localStorage du navigateur
- Vérifier que JWT_SECRET est identique

### Base de données corrompue
- Supprimer `database.sqlite`
- Relancer `npm run init-db`

## 📄 Licence

Ce projet est sous licence MIT. Libre d'utilisation pour vos projets personnels ou commerciaux.

## 👨‍💻 Support

Pour toute question ou problème :
1. Vérifier la section "Résolution de Problèmes"
2. Consulter les logs du serveur
3. Vérifier la console du navigateur

## 🎉 Fonctionnalités Futures (Suggestions)

- 📧 Notifications par email
- 📊 Graphiques avancés
- 📱 Application mobile (React Native)
- 🖨️ Génération de factures PDF
- 📍 Intégration Google Maps
- 🔔 Notifications en temps réel
- 📤 Export Excel des données
- 🔍 Recherche et filtres avancés

---

**Développé avec ❤️ pour faciliter la gestion des dépannages automobiles**
