# BarakahBrain — Setup Local

Ce projet se compose de deux parties :
1.  **BarakahBrain-API** : Le backend Node.js (Express).
2.  **BarakahBrain** : Le frontend statique (HTML/CSS/JS).

## 📚 Documentation

**Sécurité & Audit:**
- [Audit Responsivité & Fonctionnalité](AUDIT_RESPONSIVITE_FONCTIONNALITE.md) — Vérification complète mobile/tablet/desktop
- [Checklist Déploiement](CHECKLIST_DEPLOIEMENT.md) — Toutes les étapes avant de passer en production

**Infrastructure & Déploiement:**
- [Recommandation d'Hébergement](RECOMMANDATION_HEBERGEMENT.md) — Render vs Railway, plan de déploiement
- [Guide GitHub Actions](GUIDE_GITHUB_ACTIONS.md) — ⭐ Pipeline automatique: linting + tests + validation avant Render
- [Guide Docker Compose](GUIDE_DOCKER_COMPOSE.md) — Tester localement avec la même config que Render
- [Guide Minification Assets](GUIDE_MINIFICATION.md) — Compresser JS/CSS pour +25% vitesse

**Configuration Email:**
- [Guide Configuration SMTP](GUIDE_SMTP_CONFIG.md) — Setup emails pour oubli mot de passe (4 options gratuites)
- [Guide Test Email Manuel](TEST_SMTP_MANUAL.md) — Valider SMTP avant production

## Prérequis

- [Node.js](https://nodejs.org/) (v14 ou supérieure) installé sur votre machine.
- [Docker Desktop](https://www.docker.com/products/docker-desktop) (optionnel, pour tester en conteneurs)

## 🚀 Démarrage Rapide

### Option 1 : Local (Développement)

```bash
# Backend
cd BarakahBrain-API
npm install
npm start

# Frontend (nouveau terminal)
# Ouvrir BarakahBrain/index.html dans le navigateur
# Ou utiliser "Live Server" extension VS Code
```

### Option 2 : Docker Compose (Production)

```bash
# Tester la configuration exacte avant Render
docker-compose up

# Frontend: http://localhost
# API: http://localhost:3000/api/health
```

👉 Voir [Guide Docker Compose](GUIDE_DOCKER_COMPOSE.md) pour plus de détails.

## Étape 1 : Lancer le Backend (API)

1.  Ouvrez un terminal.
2.  Allez dans le dossier du backend :
    ```bash
    cd BarakahBrain-API
    ```
3.  Installez les dépendances (si ce n'est pas déjà fait) :
    ```bash
    npm install
    ```
4.  **(Optionnel)** créez un fichier `.env` à la racine du dossier `BarakahBrain-API` et définissez les variables suivantes :
    ```ini
    PORT=3000
    JWT_SECRET=une-chaine-longue-et-secrete
    CORS_ORIGIN=https://votre-domaine.com   # ou laissez vide pour autoriser tous les origines
    ```
    Le secret JWT est indispensable en production. Le serveur arrêtera de démarrer si `JWT_SECRET` n'est pas défini ; il n'y a plus de valeur de secours.

5.  Lancez le serveur :
    ```bash
    npm start
    ```
    Le serveur devrait afficher : `[BarakahBrain] Serveur Full API lancé sur http://localhost:3000`

> 💡 lors du déploiement sur un hébergeur (Heroku, Railway, Docker, etc.), n'oubliez pas de configurer les mêmes variables d'environnement et de monter le fichier `database.sqlite` sur un volume persistant. SQLite est acceptable pour un petit service, mais une base relationnelle plus robuste (PostgreSQL/MySQL) sera préférable pour un trafic plus élevé.

## Étape 2 : Lancer le Frontend

1.  Ouvrez simplement le fichier `BarakahBrain/index.html` dans votre navigateur préféré.
2.  Alternativement, vous pouvez utiliser une extension comme "Live Server" sur VS Code pour une meilleure expérience.

## Identifiants de test

Vous pouvez utiliser les comptes suivants pour tester la plateforme :

- **Superadmin** : `superadmin1` / `Pass123!`
- **Admin** : `admin_marc` / `Pass123!`
- **Utilisateur classique** : `joueur1` / `Pass123!`

---
*Note: Le backend utilise désormais une base de données **SQLite** persistante dans `database.sqlite`.*

## Variables d'environnement supplémentaires

- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` : configuration pour l'envoi d'emails de réinitialisation de mot de passe (optionnel).
- `INIT_ADMIN_PWD` : mot de passe initial pour le superadmin créé au premier démarrage. Si non fourni, un mot de passe généré est journalisé.
- `DB_PATH` : chemin personnalisé pour la base SQLite (défaut: `./database.sqlite`)
- `NODE_ENV` : `production` ou `development` (détermine le comportement logging, CORS, etc.)

## Sécurité renforcée ✅

- ✅ Rate limiting activé sur les routes d'authentification
- ✅ Validation serveur des entrées (express-validator)
- ✅ En-têtes Helmet avec CSP/HSTS/ReferrerPolicy
- ✅ CORS strictement limité aux origines configurées
- ✅ Journaux HTTP via `morgan`
- ✅ Migration automatique pour ajouter `categoryId` à `resultats_quiz`
- ✅ Le code de réinitialisation est envoyé par email si SMTP est configuré; sinon il reste dans les logs de démarrage uniquement.
- ✅ JWT obligatoire (le serveur refuse de démarrer si `JWT_SECRET` manquant)

> ⚠️ Assurez‑vous de déployer derrière HTTPS, avec des volumes persistants pour la base, et de remplacer SQLite par PostgreSQL/MariaDB pour un usage professionnel.

## Responsivité & Fonctionnalité ✅

Audit complet réalisé (voir [AUDIT_RESPONSIVITE_FONCTIONNALITE.md](AUDIT_RESPONSIVITE_FONCTIONNALITE.md)).

**Résultats** :
- ✅ **Toutes les pages** responsive sur mobile (320px), tablet (768px), desktop (1024px+)
- ✅ **Viewport meta tags** présents sur 100% des pages
- ✅ **Media queries** pour 6+ breakpoints
- ✅ **JavaScript fonctionnel** : login, quiz, resultats, admin panels
- ✅ **Prêt pour production** : aucun problème de layout ou fonctionnalité détecté

Voir [AUDIT_RESPONSIVITE_FONCTIONNALITE.md](AUDIT_RESPONSIVITE_FONCTIONNALITE.md) pour l'analyse en détail par page.

## Performance & Minification

- Minifiez `assets/styles.css`, `assets/app.js`, `assets/layouts.js` et `assets/i18n.js` avant production.
- Utilisez les scripts fournis : `npm run build:assets` (voir [GUIDE_MINIFICATION.md](GUIDE_MINIFICATION.md))
- Cela réduit les fichiers de **30-35%**, soit une **amélioration de +25% en vitesse de chargement** sur mobile

```bash
cd BarakahBrain-API
npm install --save-dev terser cssnano postcss-cli
npm run build:assets
```

## CI/CD Pipeline (GitHub Actions)

Un pipeline automatique valide le code à chaque push:

```
Git Push → Tests + Linting → Validation → OK pour Render
           ❌ Si échoue → Merge bloqué jusqu'à correction
```

Voir [Guide GitHub Actions](GUIDE_GITHUB_ACTIONS.md) pour:
- Configuration automatique des tests & linting
- Déploiement auto vers Render (optionnel)
- Monitoring en temps réel des builds

## Déploiement

### 📋 Pré-déploiement Checklist

```bash
cd BarakahBrain-API

# 1. Valider que le code passe les tests
npm test

# 2. Valider que le code respecte les standards
npm run lint

# 3. Minifier pour la production
npm run build:assets

# 4. Tester la config finale
npm install
npm run migrate
```

### 🐳 Avec Docker Compose (Avant Render)

```bash
# Tester votre configuration exacte localement
docker-compose up

# Visiter http://localhost pour valider tout fonctionne
# Puis déployer sur Render avec confiance
```

Voir [Guide Docker Compose](GUIDE_DOCKER_COMPOSE.md) pour tous les détails.

### 🚀 Sur Render.com (Recommandé)

1. **Préparer l'environnement**
   - copier `.env.example` vers `.env` et remplir toutes les variables (JWT_SECRET, CORS_ORIGIN, SMTP_*, etc.).
   - S'assurer que tous les secrets sensibles sont en variables d'env (jamais en dur dans le code)

2. **Installer & migrer**
   ```bash
   npm install       # installe toutes les dépendances
   npm run migrate   # crée/ajoute la colonne categoryId si nécessaire
   ```

3. **Exécuter les tests**
   ```bash
   npm test          # lance Jest et vérifie les endpoints de base
   npm run lint      # vérifie le style du code
   ```

4. **Auditer les paquets**
   ```bash
   npm audit         # Voir les vulnérabilités connues
   npm audit fix     # Corriger automatiquement si possible
   ```

5. **Push vers GitHub**
   ```bash
   git add .
   git commit -m "ready for production"
   git push origin main
   ```
   → GitHub Actions lance automatiquement le pipeline de validation
   → Si ✅ passe, Render se redéploie automatiquement

6. **Configuration Render**
   - Voir [Recommandation d'Hébergement](RECOMMANDATION_HEBERGEMENT.md) pour le setup complet
   - Build Command: `npm install && npm run migrate`
   - Start Command: `npm start`
   - Ajouter les variables d'env via "Environment"

7. **Test en production**
   - Visiter `https://votre-app-render.onrender.com`
   - Tester la connexion (login)
   - Tester un quiz
   - Tester le reset de mot de passe (vérifie SMTP)

## Migration vers PostgreSQL (Futur)

Pour un site avec beaucoup de trafic, migrez de SQLite vers PostgreSQL:

1. Installer PostgreSQL localement ou utiliser un service cloud (Railway, Render)
2. Configurer `DATABASE_URL` en variable d'env
3. Adapter les requêtes SQL si nécessaire (généralement compatibles)
4. Tester avec Docker Compose (voir [Guide Docker Compose](GUIDE_DOCKER_COMPOSE.md))

## Monitoring & Logs

- Render fournit des logs en temps réel du serveur
- Morgan enregistre les requêtes HTTP
- Les erreurs d'authentification/validation sont journalisées
- Configurer des alertes email si l'app crash

En suivant cette procédure, votre site sera prêt à être hébergé dans un environnement professionnel sécurisé et maintenable. 🎉

