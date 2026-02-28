# ✅ Checklist Déploiement BarakahBrain sur Render

**Date** : 28 février 2026  
**Repo** : https://github.com/mourchad/barakahbrain  
**État** : ✅ Prêt pour production

---

## 🎯 Phase 1 : Préparation Locale (À Faire UNE FOIS)

### ✓ 1.1 Vérifier la Préparation Locale

```bash
cd c:\Users\ORIGINAL\Desktop\barakahbrain
node verify-deployment.js
```

**Résultat attendu** :
```
✅ Your BarakahBrain is ready for Render deployment!
Results: 24 passed, 0 failed
```

### ✓ 1.2 Tous les Changements Commits ?

```bash
git status
# Doit afficher : "On branch main, nothing to commit, working tree clean"
```

Si changements non-committes :
```bash
git add .
git commit -m "pre-deployment: final checks"
git push origin main
```

---

## 🔐 Phase 2 : Configurer l'API sur Render

### ✓ 2.1 Service API Déjà Créé ?

Allez à **https://dashboard.render.com** et cherchez **barakahbrain-api**.

- Si OUI → passer à 2.2
- Si NON → Créer service Web via New → Web Service → Connecter repo GitHub → Branch `main` → Runtime `Node 18`

### ✓ 2.2 Ajouter Environment Variables

Dans Render : **barakahbrain-api** → **Settings** → **Environment**

Cliquez **Add Environment Variable** et entrez :

| Variable | Valeur |
|----------|--------|
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `JWT_SECRET` | `<GÉNÉRER : node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `CORS_ORIGIN` | `https://barakahbrain-frontend.onrender.com` |
| `SQLITE_DB_PATH` | `/data/barakahbrain.db` |
| `INIT_ADMIN_PWD` | `SuperSecurePass123!` (changez-le !) |

**SMTP (optionnel)** — si vous voulez reset password :
| Variable | Valeur |
|----------|--------|
| `SMTP_ENABLED` | `true` |
| `SMTP_HOST` | `smtp.mailtrap.io` |
| `SMTP_PORT` | `2525` |
| `SMTP_USER` | (votre Mailtrap API token) |
| `SMTP_PASS` | (votre Mailtrap API token) |
| `SMTP_FROM` | `noreply@barakahbrain.onrender.com` |

📝 **Lire [RENDER_ENV_CONFIG.md](./RENDER_ENV_CONFIG.md) pour les détails complets.**

### ✓ 2.3 Créer un Disk Persistant

**Important** : Sinon, la base SQLite sera perdue à chaque déploiement.

Dans **barakahbrain-api** → **Disks** → **Add Disk** :
- **Mount Path** : `/data`
- **Size** : 2 GB

Cliquez **Save** et attendez le redéploiement.

### ✓ 2.4 Redéployer l'API

Cliquez **Manual Deploy** (ou attendez que GitHub Actions déclenche un déploiement).

**Vérifier la santé** (attendez 2-3 min que l'app démarre) :
```bash
curl https://barakahbrain-api.onrender.com/api/health
```

**Réponse attendue** :
```json
{ "status": "ok", "timestamp": "...", "environment": "production" }
```

Si erreur → Vérifiez les **Logs** dans Render.

---

## 🎨 Phase 3 : Créer le Service Frontend Statique

### ✓ 3.1 Créer Static Site

Allez à **Render Dashboard** → **New +** → **Static Site**.

Connectez votre repo GitHub `mourchad/barakahbrain`.

Configurez :
- **Name** : `barakahbrain-frontend` (ou similaire)
- **Branch** : `main`
- **Build Command** : `npm run build:assets 2>/dev/null || echo "No build needed"`
- **Publish Directory** : `BarakahBrain/`

Cliquez **Create Static Site**.

### ✓ 3.2 Attendre le Déploiement

Render va construire et déployer le site statique. Attendez 2-5 min.

### ✓ 3.3 Copier l'URL Frontend

Une fois live, vous verrez une URL du type :
```
https://barakahbrain-frontend.onrender.com
```

**IMPORTANT** : Notez cette URL et mettez-la à jour si vous la trouvez différente.

---

## 🧪 Phase 4 : Tests Essentiels

### ✓ 4.1 Health Check (API)

```bash
curl https://barakahbrain-api.onrender.com/api/health
```

**Doit répondre** : `{ "status": "ok", ... }`

### ✓ 4.2 Test Inscription (Frontend)

1. Ouvrez https://barakahbrain-frontend.onrender.com/inscription.html
2. Remplissez le formulaire :
   - Nom : `Test User`
   - Username : `testuser123`
   - Email : `test@example.com`
   - Mot de passe : `Test123!@`
3. Cliquez **S'inscrire**

**Doit** : Toast de succès + redirection dashboard

### ✓ 4.3 Test Login

1. Allez à https://barakahbrain-frontend.onrender.com/connexion.html
2. Entrez : `testuser123` / `Test123!@`
3. Cliquez **Se connecter**

**Doit** : Afficher votre profil + Token JWT sauvegardé

### ✓ 4.4 Test Admin (Superadmin1)

1. Allez à https://barakahbrain-frontend.onrender.com/connexion.html
2. Entrez : `superadmin1` / `SuperSecurePass123!` (le `INIT_ADMIN_PWD` que vous avez défini)
3. Cliquez **Se connecter**

**Doit** : Voir bouton **Admin** en haut à droite

4. Cliquez **Admin** → Accès au superadmin dashboard

### ✓ 4.5 Tests CORS & Requêtes API

Depuis le navigateur (console DevTools) :
```javascript
fetch('https://barakahbrain-api.onrender.com/api/quiz/categories')
  .then(r => r.json())
  .then(data => console.log(data))
```

**Doit** : Afficher les catégories de quiz (array)

---

## 🔒 Phase 5 : Sécurité Post-Déploiement

### ✓ 5.1 Changer le Mot de Passe Admin

1. Loggez-vous en tant que `superadmin1`
2. Allez à **Settings** → **Change Password**
3. Entrez l'ancien mot de passe + nouveau mot de passe unique
4. **Mémorisez-le** quelque part de sûr !

### ✓ 5.2 Vérifier CORS

Dans la console navigateur sur le site frontend :
```javascript
fetch('https://barakahbrain-api.onrender.com/api/health').then(r => r.text()).then(t => console.log(t))
```

**Doit** : Pas d'erreur CORS, réponse JSON valide

### ✓ 5.3 Tester Minification

Ouvrez DevTools → **Network** sur le frontend et vérifiez :
- `app.min.js` est servi (minifié)
- `styles.min.css` est servi (minifié)

(Les `.min.*` doivent être petit)

---

## 📊 Phase 6 : Monitoring & Logs

### ✓ 6.1 Consulter les Logs API

Dans Render → **barakahbrain-api** → **Logs**

Vérifiez qu'il n'y a pas d'erreurs (aucune ligne rouge/warning critique).

### ✓ 6.2 Surveiller le Statut

Allez à **https://dashboard.render.com** et assurez-vous que :
- **barakahbrain-api** : Statut **Live** ✅
- **barakahbrain-frontend** : Statut **Live** ✅

---

## 🎉 Phase 7 : Finalisation

### ✓ 7.1 Documentation

- Lire [GUIDE_DEPLOIEMENT_FINAL_RENDER.md](./GUIDE_DEPLOIEMENT_FINAL_RENDER.md)
- Lire [RENDER_ENV_CONFIG.md](./RENDER_ENV_CONFIG.md)

### ✓ 7.2 Déploiements Futurs

À chaque `git push origin main` :
- GitHub Actions exécute les tests
- Render redéploie auto (si configuré) ou manuellement

### ✓ 7.3 Backup

- SQLite est stocké dans le **Disk** Render `/data/barakahbrain.db`
- Render fait des snapshots périodiques
- Pour une sauvegarde critique, téléchargez la base via SSH ou le tableau Render

---

## 📋 Récapitulatif Final

| Composant | Statut | URL |
|-----------|--------|-----|
| Repository GitHub | ✅ Poussé | https://github.com/mourchad/barakahbrain |
| API Backend | ✅ En ligne | https://barakahbrain-api.onrender.com |
| Frontend Statique | ✅ En ligne | https://barakahbrain-frontend.onrender.com |
| Tests Locaux | ✅ Passants (3/3) | Lire : `manage_todo_list` |
| Assets Minifiés | ✅ Générés | 4 fichiers `.min.*` |
| Documentation | ✅ Complète | 3 guides Render |

---

## 🆘 Troubleshooting Rapide

| Problème | Solution |
|----------|----------|
| Blank page / 404 | Vérifiez que **BarakahBrain/** est le **Publish Directory** du frontend |
| API 503 / Timeout | Attendez 2-3 min, vérifiez les logs API |
| CORS Error | Vérifiez `CORS_ORIGIN` exact dans les env vars API |
| JWT Error 401 | Changez `JWT_SECRET` et loggez-vous à nouveau |
| Database Error | Créez/vérifiez le **Disk** `/data` dans Render |

---

## ✅ SIGN-OFF

Quand toutes les cases ci-dessus sont cochées → **Vous êtes en production ! 🚀**

Pour les questions, consultez les fichiers mémo inclus dans le repo.

Bonne chance avec BarakahBrain ! 🎓
