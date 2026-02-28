# 🔐 Configuration Render — Variables d'Environnement

## Instructions Rapides

1. Allez à **[Render Dashboard](https://dashboard.render.com)**
2. Cliquez sur le service **barakahbrain-api** (API)
3. Allez dans **Settings** → **Environment**
4. Ajoutez les variables ci-dessous
5. Cliquez **Deploy** (ou attendez le redéploiement auto)

---

## 📋 Variables pour Service API

### Production Essential

```
NODE_ENV=production
PORT=3000
JWT_SECRET=<GÉNÉRER_UNE_CLÉ_COMPLEXE_CI-DESSOUS>
CORS_ORIGIN=https://barakahbrain-frontend.onrender.com
SQLITE_DB_PATH=/data/barakahbrain.db
INIT_ADMIN_PWD=AdminPass123!
INIT_ADMIN_USER=superadmin1
INIT_ADMIN_EMAIL=admin@barakahbrain.local
```

### SMTP (Optionnel — pour Reset Password)

**Option A : Mailtrap (Recommandé pour test/démo)**

```
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=<votre-api-token-mailtrap>
SMTP_PASS=<votre-api-token-mailtrap>
SMTP_FROM=noreply@barakahbrain.onrender.com
SMTP_FROM_NAME=BarakahBrain Support
SMTP_ENABLED=true
```

**Option B : Gmail (Production)**

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASS=<app-specific-password>
SMTP_FROM=votre-email@gmail.com
SMTP_FROM_NAME=BarakahBrain
SMTP_ENABLED=true
```

**Option C : Brevo/Sendinblue (Production)**

```
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=<votre-email-brevo>
SMTP_PASS=<votre-smtp-key-brevo>
SMTP_FROM=noreply@barakahbrain.onrender.com
SMTP_FROM_NAME=BarakahBrain
SMTP_ENABLED=true
```

---

## 🔑 Générer un JWT_SECRET Sécurisé

Exécutez cette commande **localement** en PowerShell/Terminal :

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copier la sortie et coller dans `JWT_SECRET` sur Render.

**Exemple de sortie** :
```
a7f8e9c12d45b6f93e2c8a1d5f7b4e6a9c2...
```

---

## 📦 Volumes Persistent (Important !)

Pour que SQLite persiste entre déploiements :

1. Dans le service **barakahbrain-api**, allez à **Disks**
2. Créez un nouveau Disk :
   - **Mount Path** : `/data`
   - **Size** : 2GB (minimum)
3. Sauvegardez et attendez le redéploiement

*Si vous n'avez pas de volume, la base de données sera réinitialisée à chaque déploiement.*

---

## 🌐 Frontend Configuration

Pour le service **barakahbrain-frontend** (Static Site) :

```
Build Command: npm run build:assets 2>/dev/null || echo "No build needed"
Publish Directory: BarakahBrain/
```

**Aucune variable d'environnement n'est nécessaire** — l'URL API est déjà codée dans les pages HTML.

---

## ✅ Checklist : CE QUE FAIRE

### Avant de Deploy

- [ ] Générer `JWT_SECRET` avec la commande ci-dessus
- [ ] Changer `INIT_ADMIN_PWD` par un mot de passe unique
- [ ] Choisir option SMTP (ou laisser vide si vous n'en avez pas besoin)
- [ ] Copier les variables dans Render

### Après Deploy

- [ ] Tester `/api/health` : `curl https://barakahbrain-api.onrender.com/api/health`
- [ ] Tester Inscription : accéder à `https://barakahbrain-frontend.onrender.com/inscription.html`
- [ ] Tester Login avec le compte créé
- [ ] Changer le mot de passe admin après premier login superadmin
- [ ] Vérifier les logs en cas d'erreur (Render → Logs)

---

## 🆘 Problèmes Courants

| Erreur | Cause | Correction |
|--------|-------|-----------|
| **401 Unauthorized** | JWT_SECRET incorrect | Assurez-vous que la clé est identique entre déploiements |
| **503 Service Unavailable** | Render startup long ou erreur | Attendez 2 min, puis vérifiez les logs |
| **Database locked** | Plusieurs instances écrivant | Assurez-vous d'une seule instance API |
| **CORS error** | CORS_ORIGIN mal configuré | Vérifiez l'URL frontend exacte |

---

## 📞 Ressources

- [Render Documentation](https://render.com/docs)
- [Mailtrap (Email Testing)](https://mailtrap.io)
- [Guide Complet](./GUIDE_DEPLOIEMENT_FINAL_RENDER.md)
- [Repository](https://github.com/mourchad/barakahbrain)

---

**Dernier geste : Naviguez vers https://barakahbrain-frontend.onrender.com et testez ! 🚀**
