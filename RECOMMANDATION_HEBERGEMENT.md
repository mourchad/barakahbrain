# Recommandation d'Hébergement : Render vs Railway

Date : 28 février 2026  
Recommandé pour BarakahBrain : **❤️ Render.com**

---

## 🏆 Comparaison Détaillée

### 1. Coût & Budget

#### Render.com
- **Free Tier** : 750 heures/mois (un service actif 24/7 + un autre en veille)
- **Upgrade** : $7/mois (Starter plan) + PostgreSQL gratuit limité
- **Échelle** : $12/mois standard, $25+ pro
- **Verdict** : ✅ **Meilleur pour budget limité**

#### Railway.app
- **Free Tier** : $5/mois de crédits (~100 heures de compute)
- **Upgrade** : Factures par usage, escalade rapide
- **Coût réel** : $20-50/mois pour un vrai service + DB
- **Verdict** : ❌ Brûle les crédits vite si trafic régulier

**Gagnant** : **Render** (750h vs 100h, pricing prévisible)

---

### 2. Disponibilité 24/7 Gratuite

#### Render.com
- Free tier = service toujours actif
- Sommeil auto après 15 min inactivité (sur Starter payant)
- **Pour vous** : API toujours disponible pendant les 750h

#### Railway.app
- Ne s'endort PAS, donc 24/7 même en free tier
- Mais crédits s'épuisent vite (~3-5 semaines de trafic léger)
- Ensuite facture ou service arrêté

**Gagnant** : **Tie** (Render = long-term gratuit, Railway = court-term 24/7)  
*Mais Render avec durée supérieure*

---

### 3. Persistance des Données (Important pour Quiz)

#### Render.com
- Volumes persistants incluent : backup auto, snapshots
- Free tier : données disparaissent à redéploiement
- **Upgrade** : $0.50/GB/mois pour volume persistant
- **Recommandé** : Migrez vers PostgreSQL ($7 Starter tier)

#### Railway.app
- Volumes aussi disponibles (payants)
- Database PostgreSQL gratuit pour test, puis **payant rapidement**
- Moins flexible sur persistance en free

**Gagnant** : **Render** (PostgreSQL intégré au Starter plan)

---

### 4. Base de Données (Critical for BarakahBrain)

#### Render.com
- PostgreSQL **GRATUIT** si vous prenez le Starter plan API ($7/mois)
- MySQL aussi disponible
- Backups auto inclus

#### Railway.app
- PostgreSQL gratuit limité (petit stockage)
- Facture rapidement au-delà de 5GB
- Moins d'intégration directe

**Gagnant** : **Render** (postgresql gratuit dès $7/mois)

---

### 5. Déploiement & CI/CD

#### Render.com
- GitHub push → Auto build/deploy
- Redeploy auto à chaque commit (configurable)
- Logs en temps réel intuitifs
- Environment variables via dashboard

#### Railway.app
- GitHub aussi, auto deploy
- Logs aussi bonnes
- Mais interface moins intuitive

**Gagnant** : **Tie** (même expérience)

---

### 6. Scalabilité Long-terme

#### Render.com
- Free → Starter ($7) → Pro ($12) → Enterprise
- Progression douce sans migration de compte
- Upgrade = cliquer un bouton

#### Railway.app
- Free → devient rapidement payant
- Escalade des coûts peut être surprise
- Moins prévisible

**Gagnant** : **Render** (évolution progressive, transparent)

---

### 7. Support & Uptime

#### Render.com
- 99.9% uptime SLA (payant)
- Support pour free tier (responses lentes)
- Documentation bonne

#### Railway.app
- 99.9% aussi
- Support moins réactif
- Moins de documentation sur edge cases

**Gagnant** : **Render** (mieux documenté)

---

## 💡 Verdict pour BarakahBrain

| Critère | Render | Railway | Winner |
|---------|--------|---------|--------|
| Coût initial | $0 (750h) | $0 (crédits) | 🟢 Render |
| Durée gratuite | 1+ mois | 2-3 semaines | 🟢 Render |
| DB gratuit | ✅ (Starter) | ❌ (limité) | 🟢 Render |
| Persistance | ✅ (volumes) | ✅ | 🟢 Render |
| Scalabilité | ✅ Smooth | ❌ Chère | 🟢 Render |
| Support | ✅ Bon | ❌ Lent | 🟢 Render |
| **Score Global** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 🏆 **Render** |

---

## 🚀 Plan de Déploiement sur Render

### Étape 1 : Préparation (5 min)
```bash
cd BarakahBrain-API
npm install
npm run migrate    # Ajoute categoryId si manquant
npm test           # Vérifie tout fonctionne
npm run lint       # Zero errors
```

### Étape 2 : GitHub (5 min)
```bash
git init
git add .
git commit -m "Initial commit: BarakahBrain API ready for production"
git push origin main  # ou master
```

### Étape 3 : Render Dashboard (5 min)
1. Inscrivez-vous sur [render.com](https://render.com) via GitHub
2. Click « New » → « Web Service »
3. Sélectionnez votre repo
4. Configurez :
   - **Environment** : Docker
   - **Port** : 3000
   - **Environment Variables** :
     ```
     JWT_SECRET=<SUPER_SECRET_LONG_STRING>
     CORS_ORIGIN=https://votre-domaine.com
     SMTP_HOST=smtp.votre-provider.com
     SMTP_USER=votre@email.com
     SMTP_PASS=app_password
     ```
5. Click « Create Web Service »

### Étape 4 : Suivi du déploiement (2-3 min)
- Render build automatiquement
- Logs visibles en temps réel
- URL finale : `https://<votre-service>.onrender.com`

### Étape 5 : Test (5 min)
```bash
# Test login
curl -X POST https://<votre-service>.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"superadmin1","password":"Pass123!"}'

# Doit retourner un token JWT
```

### Étape 6 : Optionnel - Ajouter PostgreSQL (2 min)
1. Render dashboard → « New » → « PostgreSQL »
2. Tier : « Free » ou « Starter »
3. Render crée `DATABASE_URL` automatiquement
4. Modifiez `server.js` pour utiliser `pg` au lieu de `sqlite3` (optionnel pour plus tard)

---

## 📋 Migration vers PostgreSQL (optional, plus tard)

Si vous voulez remplacer SQLite par PostgreSQL sur Render :

1. **Installer pg**
   ```bash
   npm install pg
   ```

2. **Adapter server.js**
   ```javascript
   const { Client } = require('pg');
   const client = new Client(process.env.DATABASE_URL);
   client.connect();
   
   const dbRun = (sql, params) => client.query(sql, params);
   const dbGet = (sql, params) => client.query(sql, params).then(r => r.rows[0]);
   const dbAll = (sql, params) => client.query(sql, params).then(r => r.rows);
   ```

3. **Redéployer**
   ```bash
   git push origin main
   # Render auto-redeploy
   ```

---

## ✅ Checklist Final

- [ ] `.env` configuré localement pour test
- [ ] `npm test` passe 100%
- [ ] `npm run lint` passe 100%
- [ ] GitHub repo public (ou privé OK)
- [ ] Render account créé via GitHub
- [ ] Web Service créé et déployé
- [ ] Environment variables set
- [ ] Login testé sur `https://<service>.onrender.com`
- [ ] SMS/emails configurés (optionnel)
- [ ] Domaine custom mappé (plus tard, optionnel)

---

## 🎯 Budget Annuel Estimé

### Scenario 1 : Free Tier Render (Small TPI)
- API Web Service : $0 (750h/mois)
- PostgreSQL : $0 (limité) ou $7/mois (Production)
- **Coût/an** : $0-84

### Scenario 2 : Petit trafic (100-500 users)
- API Starter : $7/mois
- PostgreSQL Starter : $7/mois
- **Coût/an** : $168

### Scenario 3 : Trafic moyen (500-2k users)
- API Standard : $12/mois
- PostgreSQL Standard : $15/mois
- **Coût/an** : $324

---

## 🔗 Liens Utiles

- [Render Docs](https://render.com/docs)
- [Render vs Heroku Migration Guide](https://render.com/docs/migrate-from-heroku)
- [Environment Variables on Render](https://render.com/docs/configure-environment-variables)
- [PostgreSQL on Render](https://render.com/docs/databases)

---

**Conclusion** : Render est le choix optimal pour BarakahBrain. Déployez aujourd'hui, scalez demain sans peine.
