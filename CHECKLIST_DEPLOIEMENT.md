# Cheklist Complet Avant Déploiement sur Render

Utilisez cette liste pour vérifier que tout est prêt avant de déployer.

---

## ✅ Phase 1 : Préparation Locale (15 min)

### 1.1 Installation & Dépendances
- [ ] `npm install` complété sans erreurs
- [ ] `node_modules/` existant

### 1.2 Configuration `.env`
- [ ] `.env` créé (copié depuis `.env.example`)
- [ ] `JWT_SECRET` rempli (min 32 caractères, fort)
- [ ] `CORS_ORIGIN` défini (votre domaine ou localhost:8000)
- [ ] `PORT=3000` confirmé

### 1.3 Test Code
- [ ] `npm run lint` : 0 erreurs
- [ ] `npm test` : tous les tests passent
- [ ] `npm start` : API démarre sans erreurs
- [ ] Logs montrent : `[BarakahBrain] Serveur Full API lancé sur http://localhost:3000`

### 1.4 Test Basique
- [ ] Testez register : `curl -X POST http://localhost:3000/api/auth/register ...`
- [ ] Testez login
- [ ] Page d'accueil charge sans erreurs

---

## ✅ Phase 2 : Configuration SMTP (10 min)

### 2.1 Choisir un Service SMTP
- [ ] Choisi entre : Mailtrap, Gmail, SendGrid, Brevo
- [ ] Account créé et gratuit

### 2.2 Obtenir Credentials
- [ ] `SMTP_HOST` noté
- [ ] `SMTP_PORT` noté (587 ou 465)
- [ ] `SMTP_USER` noté
- [ ] `SMTP_PASS` noté (app-password pour Gmail)
- [ ] `SMTP_FROM` défini (ex: noreply@barakahbrain.com)

### 2.3 Ajouter à `.env`
```env
SMTP_HOST=smtp.xxxxx.xxx
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_user
SMTP_PASS=your_pass
SMTP_FROM=noreply@barakahbrain.com
```

### 2.4 Tester SMTP Localement
- [ ] `npm run test-smtp` exécuté
- [ ] Email reçu dans votre boîte
- [ ] Script affiche `✅ Email sent successfully!`

### 2.5 Tester Forgot Password Flow
- [ ] Register utilisateur via API
- [ ] Forgot Password endpoint testé
- [ ] Email reçu avec code
- [ ] Reset password avec code fonctionne

---

## ✅ Phase 3 : Sécurité & Audit (5 min)

### 3.1 Sécurité
- [ ] `.env` N'EXISTE PAS sur GitHub (`.gitignore` contient `.env`)
- [ ] `JWT_SECRET` est une vraie chaîne forte
- [ ] Ne commitez JAMAIS de mots de passe en clair

### 3.2 Code Review Basique
- [ ] `npm run lint` : 0 erreurs
- [ ] Pas de `console.log()` sensibles (passwords, tokens)
- [ ] Pas de code commenté inutile

### 3.3 Base de Données
- [ ] `npm run migrate` exécuté (ajoute `categoryId` si manquant)
- [ ] `database.sqlite` existe

---

## ✅ Phase 4 : GitHub Setup (5 min)

### 4.1 Initialiser Repo
- [ ] `git init` exécuté
- [ ] `.gitignore` inclut : `.env`, `node_modules/`, `database.sqlite`, `tests/`

### 4.2 Committer Code
```bash
git add .
git commit -m "Initial: BarakahBrain API ready for production"
```
- [ ] Commit réussi

### 4.3 Créer Repo sur GitHub
- [ ] Repo créé sur GitHub (public ou privé)
- [ ] Remote ajouté : `git remote add origin https://github.com/votre-user/repo.git`
- [ ] Poussé : `git push -u origin main`

### 4.4 Vérifier Push
- [ ] GitHub affiche votre code
- [ ] `.env` n'est PAS visible (bon signe)
- [ ] `Dockerfile` visible
- [ ] `package.json` visible

---

## ✅ Phase 5 : Render Deployment (10 min)

### 5.1 Créer Account Render
- [ ] Inscrit sur [render.com](https://render.com)
- [ ] Login via GitHub (autorisé)

### 5.2 Créer Web Service
- [ ] Nouveau Web Service créé
- [ ] GitHub repo sélectionné
- [ ] Branch `main` sélectionnée
- [ ] Environment : `Docker` choisi

### 5.3 Configurer Environment Variables
Ajouter dans le formulaire Render :

```
JWT_SECRET=<your-strong-secret>
CORS_ORIGIN=https://<your-service>.onrender.com
SMTP_HOST=<smtp.something.com>
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=<your-smtp-user>
SMTP_PASS=<your-smtp-pass>
SMTP_FROM=noreply@barakahbrain.com
NODE_ENV=production
```

- [ ] Toutes les variables ajoutées
- [ ] Pas de typo

### 5.4 Déployer
- [ ] Click « Create Web Service »
- [ ] Render lance la build automatiquement
- [ ] Logs visibles en temps réel
- [ ] Check pour erreurs

### 5.5 Attendre Déploiement
- [ ] Build complète (2-3 min)
- [ ] Logs montrent : `[BarakahBrain] Serveur Full API lancé sur ...`
- [ ] Service en état « Live »

---

## ✅ Phase 6 : Test Post-Deploy (5 min)

### 6.1 Récupérer URL
- [ ] URL fournie par Render : `https://<votre-service>.onrender.com`

### 6.2 Test Login
```bash
curl -X POST https://<votre-service>.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"superadmin1","password":"Pass123!"}'
```
- [ ] Réponse contient un token JWT
- [ ] Pas d'erreur 500

### 6.3 Test Forgot Password
```bash
curl -X POST https://<votre-service>.onrender.com/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"votre@email.com"}'
```
- [ ] Réponse : `{"message":"Code envoyé..."}`
- [ ] Email reçu dans votre boîte

### 6.4 Test Front-end
- [ ] Ouvrez `https://<votre-service>.onrender.com` dans un navigateur
- [ ] Page d'accueil charge
- [ ] Boutons « Se connecter » visibles
- [ ] Formulaires responsive sur mobile

### 6.5 Test Mobile (Important!)
- [ ] Ouvrez sur un téléphone mobile
- [ ] Responsive design OK (pas de scroll horizontal)
- [ ] Formulaires lisibles
- [ ] Boutons clickables

---

## ✅ Phase 7 : Monitoring & Follow-up (Continu)

### 7.1 Logs
- [ ] Vérifiez les logs Render régulièrement
- [ ] Recherchez d'éventuelles erreurs 500
- [ ] Vérifiez les attempts de login échoués

### 7.2 Uptime
- [ ] Service reste en état « Live »
- [ ] Pas de redémarrages inattendus

### 7.3 SMTP
- [ ] Les codes de reset password sont envoyés
- [ ] Les emails arrivent
- [ ] Pas d'erreurs SMTP dans les logs

### 7.4 Utilisation Gratuite
- [ ] Vérifiez votre quota Render (750h/mois)
- [ ] Calculez votre consommation

---

## 🔧 Commandes Utiles

### Local
```bash
npm install              # Installer dépendances
npm start                # Lancer serveur
npm test                 # Exécuter tests
npm run lint             # Vérifier code style
npm run migrate          # Migrer base de données
npm run test-smtp        # Tester configuration SMTP
```

### Git
```bash
git status               # Vérifier fichiers à committer
git add -A               # Ajouter tous les fichiers
git commit -m "Message"  # Committer
git push origin main     # Pousser vers GitHub
```

### Render (via Dashboard)
- Allez au dashboard → Web Service
- Logs réels visibles
- Redeploy manuel si besoin
- Environment variables modifiables

---

## 🚨 Problèmes Courants & Solutions

### Problème : Build échoue sur Render
**Solution** :
- Vérifiez les logs Render
- `npm install` réussit? Vérifiez `package.json`
- `npm start` tourne? Vérifiez `server.js`

### Problème : API répond mais données vides
**Solution** :
- Base de données `database.sqlite` n'existe pas
- Exécutez `npm run migrate`
- Vérifiez `DB_PATH` si vous en avez défini

### Problème : Emails ne sont pas envoyés
**Solution** :
- Variables SMTP manquantes? Vérifiez dashboard Render
- Credentials SMTP incorrects? Test-smtp échoue? Vérifiez-les
- Limite d'envoi atteinte? Vérifiez votre service SMTP

### Problème : 500 Internal Server Error
**Solution** :
- Vérifiez les logs Render
- Exécutez `npm test` localement pour reproduire
- Recherchez l'erreur exacte dans les logs

### Problème : Page statique ne charge pas
**Solution** :
- Vérifiez `express.static` dans `server.js`
- `BarakahBrain/` existe? Avec `index.html`?
- Permission fichiers OK?

---

## ✅ Checklist FINAL

Avant d'annoncer votre site comme « en production » :

- [ ] Render URL responsive sur desktop
- [ ] Responsive sur mobile (testé sur vrai téléphone)
- [ ] Login fonctionne
- [ ] Quiz fonctionne
- [ ] Reset password fonctionne (email envoyé)
- [ ] Admin panel accessible
- [ ] Logs Render sans erreurs 500
- [ ] Service Render en état « Live »
- [ ] Uptime monitoring activé (optionnel)

---

## 🎉 Vous êtes LIVE!

Bravo! Votre BarakahBrain est maintenant en production sur Render.

**Prochaines étapes (optional)** :
- Mapper un domaine custom (https://votre-domaine.com)
- Migrer vers PostgreSQL si trafic augmente
- Setup monitoring et alertes
- Activer Analytics
- Demander feedback utilisateurs

> 📖 Voir [GUIDE_SMTP_CONFIG.md](GUIDE_SMTP_CONFIG.md) pour plus details SMTP.
> 📖 Voir [RECOMMANDATION_HEBERGEMENT.md](RECOMMANDATION_HEBERGEMENT.md) pour plus à propos Render.
