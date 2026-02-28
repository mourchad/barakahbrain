# Configuration SMTP pour Mot de Passe Oublié

Guide complet pour configurer l'envoi d'emails de réinitialisation de mot de passe sur BarakahBrain.

---

## 📧 Options SMTP Recommandées

### 1. **Mailtrap** (Recommandé pour démarrer - Gratuit) ⭐

**Avantages** :
- 500 emails/mois gratuit
- Interface web pour tester
- Parfait pour développement
- Pas besoin de domaine propre courant

**Setup** :

1. Inscrivez-vous sur [mailtrap.io](https://mailtrap.io) (gratuit)
2. Dashboard → « Sending Domain » → « Integration »
3. Choisissez « Nodemailer »
4. Vous verrez les credentials :
   ```
   Host: smtp.mailtrap.io
   Port: 587 (ou 465)
   User: votre_user
   Pass: votre_password
   ```

5. Ajoutez à votre `.env` :
   ```env
   SMTP_HOST=smtp.mailtrap.io
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=<user_from_mailtrap>
   SMTP_PASS=<pass_from_mailtrap>
   SMTP_FROM=noreply@barakahbrain.com
   ```

6. Testez localement :
   ```bash
   cd BarakahBrain-API
   npm start
   # Allez à /api/auth/forgot-password avec curl
   curl -X POST http://localhost:3000/api/auth/forgot-password \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com"}'
   
   # Vérifiez Mailtrap Dashboard → vous verrez l'email
   ```

**Coût sur Render** : Gratuit (500/mois) → très bien pour démarrage

---

### 2. **Gmail** (Gratuit si vous avez un compte Google)

**Avantages** :
- Gratuit si vous avez un Gmail
- Simple à setup
- Fiable

**Désavantages** :
- Nécessite un compte Gmail dédié (pas votre email perso)
- Google peut bloquer les apps "moins sûrs"

**Setup** :

1. Créez un compte Gmail dédié (ex: `barakahbrain.noreply@gmail.com`)

2. Activez « Accès apps moins sûrs » :
   - Allez à [myaccount.google.com/security](https://myaccount.google.com/security)
   - Scroll → « Apps et sites moins sûrs »
   - Activez

3. Créez un « App Password » (meilleure pratique) :
   - [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
   - Sélectionnez « Mail » et « Windows »
   - Google vous donne un password de 16 caractères

4. Ajoutez à `.env` :
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=barakahbrain.noreply@gmail.com
   SMTP_PASS=<16-char-app-password>
   SMTP_FROM=barakahbrain.noreply@gmail.com
   ```

5. Testez :
   ```bash
   npm start
   curl -X POST http://localhost:3000/api/auth/forgot-password \
     -H "Content-Type: application/json" \
     -d '{"email":"votre@email.com"}'
   # Vous recevez l'email!
   ```

**Coût sur Render** : Gratuit (limité par Google à ~500/jour, bon pour votre trafic)

---

### 3. **SendGrid** (Pro - Gratuit pour petit volume)

**Avantages** :
- 100 emails/jour gratuit
- Vraiment pro, analytics complètes
- Support excellent

**Setup** :

1. Inscrivez-vous sur [sendgrid.com](https://sendgrid.com) (gratuit)
2. Dashboard → Settings → API Keys
3. Créez une clé API (note-la)
4. Ajoutez à `.env` :
   ```env
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=apikey
   SMTP_PASS=<your-api-key>
   SMTP_FROM=noreply@barakahbrain.com
   ```

**Limite** : 100/jour en gratuit (bon pour démarrage)

---

### 4. **Brevo (ex-Sendinblue)** (Gratuit, Français-friendly)

**Avantages** :
- 300 emails/jour gratuit
- Support français
- Très fiable

**Setup** :

1. Inscrivez-vous sur [brevo.com](https://brevo.com) (gratuit)
2. Dashboard → SMTP & API → SMTP
3. Credentials :
   ```
   Host: smtp-relay.brevo.com
   Port: 587
   User: votre_email
   Pass: votre_clé_api
   ```

4. Ajoutez à `.env` :
   ```env
   SMTP_HOST=smtp-relay.brevo.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=<votre-email>
   SMTP_PASS=<votre-api-key>
   SMTP_FROM=noreply@barakahbrain.com
   ```

**Limit** : 300/jour (excellent pour démarrage)

---

## 🔧 Configuration sur Render

### Après votre déploiement initial sur Render :

1. Dashboard Render → Sélectionnez votre Web Service
2. Onglet « Environment »
3. Ajoutez les variables :
   ```
   SMTP_HOST=smtp.mailtrap.io  (ou autre)
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your_user
   SMTP_PASS=your_pass
   SMTP_FROM=noreply@barakahbrain.com
   ```

4. Click « Save »
5. Render auto-redeploy avec ces variables
6. Les emails fonctionnent maintenant! 🎉

### Tester sur Render :

```bash
# Via curl depuis n'importe où
curl -X POST https://<votre-service>.onrender.com/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"votre@email.com"}'

# Vous recevrez un email de reset dans quelques secondes
```

---

## 🧪 Test Local Complet

### Étape 1 : Setup Local avec Mailtrap

```bash
cd BarakahBrain-API

# Créez .env avec Mailtrap credentials
cat > .env << 'EOF'
PORT=3000
JWT_SECRET=your-super-secret-123
CORS_ORIGIN=http://localhost:8000
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=<your_mailtrap_user>
SMTP_PASS=<your_mailtrap_pass>
SMTP_FROM=noreply@barakahbrain.com
EOF

npm install  # Si pas déjà fait
npm start
```

### Étape 2 : Register un utilisateur

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "StrongPass123!",
    "fullName": "Test User"
  }'
```

### Étape 3 : Forgot Password

```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Réponse attendue:
# {"message":"Code envoyé (vérifiez votre boîte mail)"}
```

### Étape 4 : Vérifiez Mailtrap

1. Allez sur votre dashboard Mailtrap
2. Cliquez sur le dernier email reçu
3. Vous verrez le code (ex: `123456`)

### Étape 5 : Reset Password

```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "code": "123456",
    "newPassword": "NewStrongPass456!"
  }'

# Réponse:
# {"message":"Mot de passe réinitialisé"}
```

### Étape 6 : Login avec nouveau password

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "NewStrongPass456!"
  }'

# Vous recevez un token JWT ✅
```

---

## 📋 Checklist SMTP par Plateforme

### Mailtrap
- [ ] Account créé sur mailtrap.io
- [ ] Integration (Nodemailer) affichée
- [ ] Credentials copiés
- [ ] `.env` rempli
- [ ] Test local: email reçu ✅

### Gmail
- [ ] Compte Gmail dédié créé
- [ ] « Accès apps moins sûrs » activé
- [ ] App Password généré
- [ ] `.env` rempli avec app password
- [ ] Test local: email reçu ✅

### SendGrid/Brevo
- [ ] Account créé
- [ ] API Key généré
- [ ] `.env` rempli
- [ ] Test local: email reçu ✅

### Render
- [ ] Variables d'environnement ajoutées au dashboard
- [ ] Redeploy complété
- [ ] Test: email reçu depuis Render ✅

---

## 🚨 Troubleshooting SMTP

### Problème : "Connection refused"
**Solution** :
```bash
# Vérifiez que SMTP_HOST est correct
# Vérifiez SMTP_PORT (587 pour TLS, 465 pour SSL)
# Si 465, changez SMTP_SECURE=true
```

### Problème : "Authentication failed"
**Solution** :
```bash
# Vérifiez SMTP_USER et SMTP_PASS
# Prenez-les DIRECTEMENT du dashboard du service
# (ne pas inventer le format)
```

### Problème : "Timeout after X seconds"
**Solution** :
```bash
# Votre firewall/VPN bloque le port 587?
# Essayez port 465 avec SMTP_SECURE=true
# Ou demandez à votre admin réseau
```

### Problème : Emails vont au spam
**Solution** :
```bash
# Ajoutez un SPF record à votre domaine (si vous en avez un)
# Ou changez SMTP_FROM pour matcher l'email du service
# Ex: si vous utilisez Gmail, SMTP_FROM = barakahbrain.noreply@gmail.com
```

### Problème : "Too many emails sent today"
**Solution** :
```bash
# Vous avez dépassé la limite gratuite
# Upgrade le plan SMTP OU
# Utilisez un compte Gmail personnel (limite plus haute)
```

---

## 🔐 Sécurité SMTP

### ✅ Bonnes Pratiques

1. **Ne committez JAMAIS `.env`** vers GitHub
   ```bash
   # Vérifiez .gitignore:
   echo ".env" >> .gitignore
   git add .gitignore && git commit -m "Add .env to gitignore"
   ```

2. **Utilisez une adresse noreply@** (pas votre email perso)
   ```env
   SMTP_FROM=noreply@barakahbrain.com
   ```

3. **Changez SMTP_USER/PASS après déploiement** si nécessaire
   ```bash
   # Rotate API keys tous les 6 mois
   # Sur le dashboard du service SMTP
   ```

4. **Loggez les erreurs SMTP**
   ```bash
   # Déjà intégré dans server.js:
   # catch (mailErr) { console.warn('Impossible d\'envoyer l\'email...') }
   ```

---

## 📊 Comparaison des Services Gratuits

| Service | Emails/mois | Setup | Support | Fiabilité |
|---------|-------------|-------|---------|-----------|
| **Mailtrap** | 500 | ⭐⭐⭐⭐⭐ Facile | Bon | ⭐⭐⭐⭐⭐ |
| **Gmail** | ~15000 | ⭐⭐⭐ Moyen | Google | ⭐⭐⭐⭐⭐ |
| **SendGrid** | 3100 | ⭐⭐⭐⭐ | Excellent | ⭐⭐⭐⭐⭐ |
| **Brevo** | 9000 | ⭐⭐⭐⭐ | Bon (FR) | ⭐⭐⭐⭐ |

**Recommandation** : Commencez par **Mailtrap** pour tester, puis passez à **Gmail** ou **Brevo** en production (limite plus haute).

---

## 🚀 Prochaines Étapes

1. **Choisissez un service** parmi les 4 ci-dessus
2. **Configurez `.env` localement** et testez (étapes ci-dessus)
3. **Une fois OK**, ajoutez les variables à Render dashboard
4. **Testez sur Render** via curl ou interface web

Et c'est tout! Vos utilisateurs reçevront maintenant des emails de reset password. 📧✨
