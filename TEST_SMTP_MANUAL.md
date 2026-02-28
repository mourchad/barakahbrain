# Test SMTP Sans Script (Quick Reference)

Si vous préférez tester manuellement sans utiliser `npm run test-smtp`, voici comment faire.

---

## 1️⃣ Configuration Minimale

Assurez-vous que votre `.env` contient :

```env
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_user
SMTP_PASS=your_password
SMTP_FROM=noreply@barakahbrain.com
```

---

## 2️⃣ Démarrer l'API

```bash
cd BarakahBrain-API
npm start
```

Output attendu :
```
[BarakahBrain] Serveur Full API lancé sur http://localhost:3000
```

---

## 3️⃣ Tester le Forgot Password Endpoint

### Step 1 : Register un utilisateur test

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "john@example.com",
    "password": "TestPass123!",
    "fullName": "John Doe"
  }'
```

Response attendue :
```json
{"message":"Compte créé"}
```

### Step 2 : Demander Forgot Password

```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com"}'
```

Response :
```json
{"message":"Code envoyé (vérifiez votre boîte mail)"}
```

Si SMTP fonctionne, un email devrait arriver **immédiatement**.

---

## 4️⃣ Vérifier l'Email Reçu

### Option A : Mailtrap Dashboard

1. Allez sur [mailtrap.io](https://mailtrap.io)
2. Dashboard → Inbox
3. Vous verrez l'email avec le code dedans (ex: `123456`)

### Option B : Gmail / Votre Email Personnel

1. Ouvrez votre boîte mail
2. Vérifiez les spams si pas dans inbox
3. Email contient un code à 6 chiffres

---

## 5️⃣ Tester Reset Password

Une fois que vous avez le code (ex: `123456`), testez le reset :

```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "code": "123456",
    "newPassword": "NewPass456!"
  }'
```

Response :
```json
{"message":"Mot de passe réinitialisé"}
```

---

## 6️⃣ Vérifier avec le Nouveau Mot de Passe

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "NewPass456!"
  }'
```

Response :
```json
{
  "token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user":{
    "id":1,
    "username":"testuser",
    "role":"User",
    "fullName":"John Doe"
  }
}
```

✅ **SMTP fonctionne parfaitement!**

---

## 🔍 Dépannage

### Email ne arrive pas

**Geste 1** : Vérifiez les logs du serveur
```bash
# Dans le terminal où npm start tourne, cherchez :
# ✅ "Email sent to..."  → SMTP fonctionne
# ❌ "Impossible d'envoyer l'email"  → SMTP error
```

**Geste 2** : Vérifiez les variables SMTP
```bash
# Dans .env, assurez-vous :
# - SMTP_HOST n'est pas vide
# - SMTP_USER n'est pas vide
# - SMTP_PASS correctement copié (pas d'espaces)
# - SMTP_PORT correct (587 par défaut)
```

**Geste 3** : Testez avec `npm run test-smtp`
```bash
npm run test-smtp john@example.com
```

### Erreur "Authentication failed"

- Vérifiez SMTP_USER et SMTP_PASS
- Pour Gmail : Utilisez le **App Password**, pas le mot de passe normal
- Pour Mailtrap : Prenez exactement les credentials d'Integration → Nodemailer

### Erreur "Connection refused"

- SMTP_HOST mal épelé?
- Votre firewall bloque le port 587?
- Essayez `curl -v smtp.mailtrap.io:587` pour tester la connexion

---

## 📝 Exemple Mailtrap Complet

### Configuration `.env` pour Mailtrap

```env
PORT=3000
JWT_SECRET=testsecret12345678901234567890
CORS_ORIGIN=http://localhost
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=abc123def456  # Votre Mailtrap User ID
SMTP_PASS=xyz789uvw012  # Votre Mailtrap Password
SMTP_FROM=noreply@barakahbrain.com
```

### Vérifier sur Mailtrap

1. [mailtrap.io](https://mailtrap.io) → Login
2. Dashboard → Votre domaine d'envoi
3. Cliquez sur « Email Inbox »
4. Vous verrez tous les emails de test

### Exemple Response Mailtrap

```
From: noreply@barakahbrain.com
To: john@example.com
Subject: Réinitialisation de mot de passe
Body: Votre code de réinitialisation est : 123456
```

---

## ✅ Checklist Rapide SMTP

- [ ] `.env` rempli (SMTP_*)
- [ ] `npm start` Lance sans erreur
- [ ] Forgot password endpoint appelé
- [ ] Email reçu dans boîte mail
- [ ] Code extrait de l'email
- [ ] Reset password fonctionne avec le code
- [ ] Login possible avec nouveau password

Si toutes les cases sont cochées, **SMTP prêt pour Render!** ✅

---

## 🚀 Prochaine Étape

Une fois SMTP validé localement :

1. Ajoutez les variables SMTP au dashboard Render
2. Render auto-redéploie
3. SMTP fonctionne en production 🎉

> 📖 Voir [GUIDE_SMTP_CONFIG.md](GUIDE_SMTP_CONFIG.md) pour plus de détails et d'options de service.
