# 🚀 Guide Final de Déploiement sur Render — BarakahBrain

**Date** : 28 février 2026  
**État** : Prêt pour production  
**API Documentée** : https://barakahbrain-api.onrender.com  

---

## 📋 Checklist Pré-Déploiement

- [x] Code sécurisé (JWT, validation, rate-limiting, Helmet/CSP)
- [x] Tests passants localement (`npm test` — 3/3 ✓)
- [x] Assets minifiés (`npm run build:assets` ✓)
- [x] Linting validé (`npm run lint`)
- [x] Frontend : `window.API_BASE` injecté dans pages HTML
- [x] Frontend : fallback `meta[name="api-base"]` en place
- [x] GitHub repo poussé avec CI/CD workflows
- [ ] Variables d'environnement Render configurées
- [ ] Service Frontend statique créé sur Render
- [ ] Health endpoint validé en production
- [ ] Auth flows testés sur Render

---

## 🔧 Étape 1 : Configurer l'API sur Render

### 1.1 Variables d'Environnement (API Service)

Accédez au service **`barakahbrain-api`** sur Render et définissez ces variables :

| Variable | Valeur | Notes |
|----------|--------|-------|
| `NODE_ENV` | `production` | Mode production |
| `PORT` | `3000` | Port interne (Render l'expose) |
| `JWT_SECRET` | `votre-secret-très-complexe-128-caractères` | ⚠️ Changez cette valeur ! Min 64 chars |
| `CORS_ORIGIN` | `https://barakahbrain.onrender.com` | Remplacer par URL frontend |
| `SQLITE_DB_PATH` | `/data/barakahbrain.db` | Render persistent volume |
| `INIT_ADMIN_PWD` | `AdminPass123!` | Mot de passe admin initial (changez-le !) |

#### Variables SMTP (optionnel, pour reset password & notifications)

| Variable | Valeur | Notes |
|----------|--------|-------|
| `SMTP_HOST` | `smtp.mailtrap.io` | Ou votre provider (Gmail, Brevo, etc.) |
| `SMTP_PORT` | `2525` | Généralement 2525 ou 587 |
| `SMTP_USER` | `votre-email-mailtrap` | User Mailtrap |
| `SMTP_PASS` | `votre-token-mailtrap` | Token account |
| `SMTP_FROM` | `noreply@barakahbrain.onrender.com` | Email système |
| `SMTP_FROM_NAME` | `BarakahBrain Support` | Nom affiché |

### 1.2 Volumes ou Persistent Data (Important !)

Render offre des volumes persistants pour SQLite. **Avant** que l'app démarre, assurez-vous que `/data/` existe ou créez-le dans `server.js` :

```javascript
// En haut de server.js
import fs from 'fs';
const dataDir = '/data';
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
```

Si vous utilisez Render Free ou sans volume, la base de données sera réinitialisée à chaque déploiement — **non recommandé pour production**.

---

## 🎨 Étape 2 : Créer le Service Frontend sur Render

### 2.1 Nouveau Service : Static Site

1. Allez sur **[Render Dashboard](https://dashboard.render.com)**
2. Cliquez sur **New +** → **Static Site**
3. Remplissez :
   - **Name** : `barakahbrain-frontend`
   - **Branch** : `main`
   - **Build Command** : `npm run build:assets 2>/dev/null || echo "No build needed"`
   - **Publish directory** : `BarakahBrain/`

### 2.2 Configuration Environnement (Frontend)

Aucune variable d'environnement n'est nécessaire pour le site statique. Le `meta[name="api-base"]` est déjà codé en dur dans les HTML avec l'URL de l'API.

Si vous préférez injecter l'URL API dynamiquement, vous pouvez ajouter un **build hook** ou passer par un `_headers` file (Render ne le supporte pas nativement, mais vous pouvez le faire via Netlify ou Vercel à la place).

**Pour cette version, l'URL API est dans les HTML** — c'est acceptable et simple.

### 2.3 URL Finale

Après création, vous aurez :
- **API** : `https://barakahbrain-api.onrender.com`
- **Frontend** : `https://barakahbrain-frontend.onrender.com` (ou un nom similaire)

---

## ✅ Étape 3 : Valider la Production

### 3.1 Health Check (API)

```bash
curl -X GET https://barakahbrain-api.onrender.com/api/health
```

**Réponse attendue** :
```json
{
  "status": "ok",
  "timestamp": "2026-02-28T...",
  "environment": "production"
}
```

*Si erreur 503 ou timeout, attendez 1-2 min. Render peut prendre du temps au démarrage.*

### 3.2 Test Inscription (Frontend)

1. Ouvrez `https://barakahbrain-frontend.onrender.com/inscription.html`
2. Créez un utilisateur de test :
   - Nom : `Test User`
   - Username : `testuser`
   - Email : `test@example.com`
   - Mot de passe : `Test123!@`

**Réponse attendue** : Toast de succès + redirection vers le dashboard.

### 3.3 Test Login

1. Allez à `https://barakahbrain-frontend.onrender.com/connexion.html`
2. Connectez-vous avec `testuser` / `Test123!@`

**Réponse attendue** : Accès au profil utilisateur + token JWT dans sessionStorage.

### 3.4 Test Admin (Superadmin)

1. Allez à `https://barakahbrain-frontend.onrender.com/connexion.html`
2. Connectez-vous avec `superadmin1` / (utiliser le `INIT_ADMIN_PWD` que vous avez défini)
3. Vous devriez voir le bouton **Admin** en haut à droite
4. Cliquez pour accéder au dashboard admin

**Réponse attendue** : Accès au superadmin-dashboard.html avec listes d'utilisateurs/questions.

---

## 🔐 Étape 4 : Sécurité Post-Déploiement

### 4.1 CORS

Vérifiez que votre frontend peut appeler l'API :
```bash
curl -X GET https://barakahbrain-api.onrender.com/api/quiz/categories \
  -H "Authorization: Bearer <votre-token-jwt>"
```

Si erreur CORS, vérifiez que `CORS_ORIGIN` dans Render correspond exactement à l'URL frontend.

### 4.2 JWT Secret

⚠️ **IMPORTANT** : Remplacez `JWT_SECRET` par une clé forte et **unique** pour votre environnement de production. Utilisez :

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4.3 Admin Password

Changez `INIT_ADMIN_PWD` dès que possible nach votre premier login superadmin.

---

## 📦 Étape 5 : Déploiements Futurs

### Trigger Automatique (GitHub Actions)

Chaque `git push` vers `main` déclenche le workflow CI :
1. Lint check
2. Test suite
3. Minification (optionnel en CI)
4. Auto-deploy sur Render (si vous avez lié Render à GitHub)

### Secret Render Deploy Hook (Optionnel)

Pour des déploiements immédiats :
1. Allez dans **Settings** → **Deploy Hook** du service API
2. Copiez l'URL
3. Ajoutez-la dans **GitHub Secrets** comme `RENDER_DEPLOY_HOOK_API`
4. Utilisez une GitHub Action pour déclencher cette URL après `npm test` réussi

---

## 🐛 Troubleshooting

| Problème | Cause | Solution |
|----------|-------|----------|
| **404 Not Found** sur frontend | CSS/JS non minifiés ou build comando incorrect | Vérifiez que `npm run build:assets` fonctionne localement |
| **CORS Error** | `CORS_ORIGIN` ne correspond pas | Mettez à jour `CORS_ORIGIN` dans Render env vars |
| **Blank Page** | API inaccessible ou timeout | Vérifiez `/api/health` et attendez le démarrage complet |
| **JWT Error (401)** | Token expiré ou secret mismatch | Reconnectez-vous ou vérifiez `JWT_SECRET` |
| **Database Error** | Volume non créé | Créez `/data/` manuellement ou redéployez |

---

## 📋 Checklist Déploiement Final

- [ ] Variables d'environnement API définies sur Render
- [ ] Service Frontend statique créé et déployé
- [ ] Health endpoint répond (`/api/health`)
- [ ] Register/Login testés sur frontend
- [ ] Admin panel accessible avec superadmin1
- [ ] CORS fonctionnelle
- [ ] JWT Secret changé et sécurisé
- [ ] Admin Password changé
- [ ] Logs vérifiés ( Render → Logs → API service)
- [ ] Tests e2e validés (inscription → login → quiz)

---

## 📞 Support

- **Docs Render** : https://render.com/docs
- **Repository** : https://github.com/mourchad/barakahbrain
- **API Docs** : Lire `BarakahBrain-API/server.js` endpoints (voir commentaires)

---

**Votre plateforme BarakahBrain est prête à accueillir des utilisateurs en production !** 🎉
