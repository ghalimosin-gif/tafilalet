# 🌐 Guide de Déploiement en Production

Ce guide vous explique comment déployer votre application de gestion de dépannage automobile en ligne **gratuitement**.

## Option 1 : Render.com (Recommandée) ⭐

Render offre un hébergement gratuit pour le backend et le frontend.

### Étape 1 : Préparer le Code

1. **Créer un compte GitHub** (si vous n'en avez pas)
2. **Créer un nouveau repository** sur GitHub
3. **Pusher le code** :

```bash
cd depannage-auto
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/votre-username/depannage-auto.git
git push -u origin main
```

### Étape 2 : Déployer le Backend sur Render

1. Aller sur [Render.com](https://render.com) et créer un compte
2. Cliquer sur **"New +"** → **"Web Service"**
3. Connecter votre repository GitHub
4. Configuration :
   - **Name :** `depannage-auto-backend`
   - **Root Directory :** `backend`
   - **Environment :** `Node`
   - **Build Command :** `npm install`
   - **Start Command :** `npm start`
   - **Instance Type :** `Free`

5. **Variables d'environnement** (onglet Environment) :
   ```
   JWT_SECRET=votre_secret_jwt_super_securise_123456789
   NODE_ENV=production
   ```

6. Cliquer sur **"Create Web Service"**

7. Attendre le déploiement (5-10 minutes)

8. **Noter l'URL** de votre backend (ex: `https://depannage-auto-backend.onrender.com`)

### Étape 3 : Déployer le Frontend sur Render

1. Cliquer sur **"New +"** → **"Static Site"**
2. Sélectionner le même repository
3. Configuration :
   - **Name :** `depannage-auto-frontend`
   - **Root Directory :** `frontend`
   - **Build Command :** `npm install && npm run build`
   - **Publish Directory :** `build`

4. **Variables d'environnement** :
   ```
   REACT_APP_API_URL=https://depannage-auto-backend.onrender.com/api
   ```
   ⚠️ Remplacer par votre vraie URL backend !

5. Cliquer sur **"Create Static Site"**

6. Attendre le déploiement (5-10 minutes)

7. **Votre site est en ligne !** 🎉

### Étape 4 : Initialiser la Base de Données

Sur Render, la base de données SQLite n'est pas persistante. Pour la production, vous devez :

#### Option A : Utiliser PostgreSQL (Gratuit sur Render)

1. Sur Render, créer une **"PostgreSQL Database"**
2. Modifier `backend/server.js` pour utiliser PostgreSQL :

```bash
npm install pg
```

Puis remplacer la connexion SQLite par PostgreSQL (code fourni sur demande).

#### Option B : Garder SQLite (Simple mais non persistant)

Rien à faire, mais les données seront réinitialisées à chaque redémarrage.

---

## Option 2 : Vercel (Frontend) + Render (Backend)

### Backend sur Render
Suivre les étapes de l'Option 1, Étape 2

### Frontend sur Vercel

1. Installer Vercel CLI :
```bash
npm install -g vercel
```

2. Déployer :
```bash
cd frontend
vercel
```

3. Suivre les instructions :
   - **Project Name :** `depannage-auto-frontend`
   - **Framework :** `Create React App`

4. Configurer l'environnement :
```bash
vercel env add REACT_APP_API_URL
# Entrer : https://votre-backend.onrender.com/api
```

5. Redéployer :
```bash
vercel --prod
```

---

## Option 3 : Netlify (Frontend) + Render (Backend)

### Backend sur Render
Suivre les étapes de l'Option 1, Étape 2

### Frontend sur Netlify

1. Aller sur [Netlify.com](https://netlify.com)
2. Drag & drop le dossier `frontend/build` (après avoir fait `npm run build`)
3. Ou connecter GitHub pour un déploiement automatique
4. Configuration :
   - **Build Command :** `npm run build`
   - **Publish Directory :** `build`
   - **Base Directory :** `frontend`

5. Variables d'environnement :
   ```
   REACT_APP_API_URL=https://votre-backend.onrender.com/api
   ```

---

## Option 4 : Heroku (Payant depuis 2022)

⚠️ Heroku n'est plus gratuit. Coût : environ 7$/mois par application.

### Backend

```bash
cd backend
heroku login
heroku create depannage-auto-backend
heroku config:set JWT_SECRET=votre_secret_jwt
git subtree push --prefix backend heroku main
```

### Frontend

```bash
cd frontend
heroku create depannage-auto-frontend
heroku config:set REACT_APP_API_URL=https://depannage-auto-backend.herokuapp.com/api
git subtree push --prefix frontend heroku main
```

---

## 🔒 Migration vers PostgreSQL (Production)

Pour une vraie production, utilisez PostgreSQL au lieu de SQLite.

### 1. Installer PostgreSQL sur Render

1. Sur Render, créer une **"PostgreSQL Database"**
2. Noter les informations de connexion

### 2. Modifier le Code Backend

Installer le driver PostgreSQL :
```bash
cd backend
npm install pg
```

Modifier `backend/server.js` :

```javascript
// Remplacer
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

// Par
const { Pool } = require('pg');
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
```

### 3. Adapter les Requêtes

SQLite et PostgreSQL ont quelques différences :

```javascript
// SQLite
db.run('INSERT INTO missions ...', [values], function(err) {
  const id = this.lastID;
});

// PostgreSQL
db.query('INSERT INTO missions ... RETURNING *', [values], (err, result) => {
  const newRow = result.rows[0];
});
```

### 4. Créer les Tables

Créer un fichier `backend/setup-postgres.js` :

```javascript
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function setup() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS utilisateurs (
      id SERIAL PRIMARY KEY,
      login VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL CHECK(role IN ('employe', 'admin')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ... autres tables ...

  const adminPassword = await bcrypt.hash('admin123', 10);
  await pool.query(
    'INSERT INTO utilisateurs (login, password, role) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
    ['admin', adminPassword, 'admin']
  );

  console.log('✅ Base PostgreSQL configurée !');
  pool.end();
}

setup();
```

Exécuter :
```bash
node setup-postgres.js
```

---

## 🔐 Checklist de Sécurité Production

Avant de mettre en production :

- [ ] Changer `JWT_SECRET` avec une valeur sécurisée
- [ ] Changer les mots de passe par défaut
- [ ] Activer HTTPS (automatique sur Render/Vercel/Netlify)
- [ ] Configurer les CORS correctement
- [ ] Ajouter des rate limits (optionnel)
- [ ] Mettre à jour les dépendances : `npm update`
- [ ] Tester tous les workflows
- [ ] Configurer les sauvegardes de la base de données

---

## 📊 Monitoring et Logs

### Sur Render
- Les logs sont disponibles dans le dashboard
- Aller sur votre service → onglet "Logs"

### Sur Vercel
- Dashboard → Votre projet → Deployments → Logs

### Sur Netlify
- Dashboard → Votre site → Deploys → Deploy log

---

## 🆘 Dépannage Déploiement

### L'application backend ne démarre pas
1. Vérifier les logs
2. Vérifier les variables d'environnement
3. Vérifier que `npm install` s'est bien exécuté

### Le frontend ne se connecte pas au backend
1. Vérifier `REACT_APP_API_URL`
2. Vérifier que le backend est bien en ligne
3. Vérifier les CORS dans le backend
4. Ouvrir la console navigateur pour voir les erreurs

### Erreur 500 sur le backend
1. Vérifier les logs du serveur
2. Vérifier que la base de données est initialisée
3. Vérifier les variables d'environnement

### Les variables d'environnement ne sont pas prises en compte
1. Sur Render : les modifier dans Settings → Environment
2. Redéployer après modification
3. Pour React : les variables doivent commencer par `REACT_APP_`

---

## 💡 Bonnes Pratiques

1. **Toujours tester localement avant de déployer**
2. **Utiliser des branches Git** (main, develop, staging)
3. **Sauvegarder régulièrement** la base de données
4. **Monitorer les performances** (CPU, RAM, requêtes)
5. **Mettre à jour les dépendances** régulièrement
6. **Documenter les changements** (CHANGELOG.md)

---

## 📈 Évolutions Possibles

Une fois déployé, vous pouvez améliorer :

- 🗄️ Migrer vers PostgreSQL (plus robuste)
- 🔔 Ajouter des notifications email
- 📊 Ajouter des graphiques (Chart.js, Recharts)
- 🔍 Ajouter une recherche avancée
- 📱 Créer une app mobile (React Native)
- 🖨️ Générer des PDF (factures)
- 🌍 Ajouter plusieurs langues
- 🔐 Authentification OAuth (Google, etc.)

---

**Besoin d'aide ?** N'hésitez pas à consulter :
- Documentation Render : https://render.com/docs
- Documentation Vercel : https://vercel.com/docs
- Documentation Netlify : https://docs.netlify.com
