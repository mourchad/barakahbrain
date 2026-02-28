# Guide de Configuration GitHub Actions CI/CD

## Vue d'ensemble

Ce guide explique comment configurer et utiliser les workflows GitHub Actions pour automatiser le test, linting et déploiement de votre application BarakahBrain.

## Workflows Disponibles

### 1. **ci-cd.yml** - Pipeline Principal (Obligatoire)

**Déclencheur:**
- ✅ Chaque push vers `main`, `master`, `develop`
- ✅ Chaque Pull Request vers `main`, `master`

**Étapes:**
1. **Install Dependencies** - npm install en mode CI (package-lock.json)
2. **Run ESLint** - Validation du code (0 erreurs requis)
3. **Run Tests** - Jest + Supertest (0 erreurs requis)
4. **Frontend Assets Check** - Vérifie que les fichiers CSS/JS existent
5. **Docker Build Validation** - Teste la construction Docker (optionnel, sur main)
6. **npm audit** - Analyse les vulnérabilités npm (alerte mais ne bloque pas)
7. **TruffleHog Scan** - Détecte les secrets exposés (API keys, tokens, etc.)
8. **Status Notification** - Affiche le résultat final

**Résultats dans GitHub:**
- ✅ Checkmark vert = Code sain, prêt pour Render
- ❌ X rouge = Tests/linting échoués, **Merge bloqué**

---

### 2. **deploy.yml** - Déploiement Automatique vers Render (Optionnel)

**Déclencheur:**
- ✅ Après succès du pipeline ci-cd.yml sur `main`
- ✅ Manuel via "Actions" > "Deploy to Render" > "Run workflow"

**Prérequis:**
- Un secret GitHub nommé `RENDER_DEPLOY_HOOK` contenant votre lien de déploiement Render

**Étapes:**
1. Déclenche le déploiement Render via webhook
2. Affiche le commit SHA et message dans les logs
3. Continue même si le webhook échoue (déploiement manuel possible)

---

## Configuration Initiale

### Step 1: Vérifier les Workflows dans GitHub

```
Allez dans votre repository GitHub
  → Actions
    → Vérifiez que "ci-cd" et "deploy" sont listés
```

### Step 2: Ajouter le Secret pour Déploiement (Optionnel)

Si vous voulez auto-déploiter vers Render:

1. **Obtenir le Deploy Hook Render:**
   - Render Dashboard → Services → BarakahBrain → Settings
   - Scroll vers "Deploy Hook"
   - Copiez l'URL

2. **Ajouter le Secret GitHub:**
   - GitHub Repo → Settings → Secrets and variables → Actions
   - New repository secret
   - Name: `RENDER_DEPLOY_HOOK`
   - Value: [Collez l'URL Render]
   - Save

### Step 3: Test du Pipeline

```bash
# Poussez un commit simple vers main
git add .
git commit -m "test: activate GitHub Actions"
git push origin main
```

**Vérifiez les résultats:**
- GitHub → Actions → Cherchez "ci-cd" dans la liste
- Cliquez pour voir les détails en temps réel
- Attendre 2-3 minutes pour la complétion

---

## Résultats Attendus

### ✅ Pipeline Réussi

```
✅ Use Node.js 18.x
✅ Install dependencies (Backend)
✅ Run ESLint (Code Quality) - 0 errors found
✅ Run Tests (Unit & Integration) - 3/3 passed
✅ Check Frontend Assets Exist - All found
✅ Validate Docker Build - Success
✅ npm audit - 7 low severity (OK)
✅ TruffleHog - No secrets detected
✅ All checks passed!
```

**Résultat:** ✅ Merge autorisé, Render prêt

### ❌ Pipeline Échoué

Si vous voyez une croix rouge:
1. Cliquez sur le workflow en question
2. Identifiez l'étape échouée:
   - **ESLint failure** → `npm run lint` en local et corrigez
   - **Test failure** → `npm test` en local et débuggez
   - **Docker failure** → `docker build` en local

3. Corrigez le problème
2. Poussez un nouveau commit
4. Le workflow se relance automatiquement

---

## Dépannage Courant

### "Tests failed" sur GitHub mais réussis en local

**Solution:**
```bash
# Synchronisez votre environnement local avec GitHub
cd BarakahBrain-API
rm -rf node_modules package-lock.json
npm install
npm test
```

### "ESLint error" différent en local et GitHub

**Solution:**
GitHub utilise npm ci (strict) au lieu de npm install (flexible)
```bash
npm ci
npm run lint
```

### "Docker build failed" mais local fonctionne

**Solution:**
Ajoutez votre .env au .dockerignore ou utilisez des variables d'environnement Render:
```bash
docker build -t barakahbrain-api:test . --build-arg NODE_ENV=production
```

### Deploy hook non trouvé

Si `deploy.yml` échoue silencieusement:
1. Render → Settings → Scroll jusqu'à "Deploy Hook"
2. Créez un nouveau hook si absent
3. Copiez le webhook URL
4. GitHub → Settings → Secrets → Mise à jour `RENDER_DEPLOY_HOOK`

---

## Surveillance Continue

### Statut en Temps Réel

```
GitHub Repo → Branches
  → main branch
    → Voir l'indicateur de commit (✅ ou ❌)
```

### Badge pour README

Ajoutez ce badge au README.md:

```markdown
[![CI/CD Pipeline](https://github.com/YourUsername/barakahbrain/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/YourUsername/barakahbrain/actions)
```

(Remplacez `YourUsername` par votre GitHub username)

---

## Flux de Travail Recommandé

### Pour les Features

```bash
# 1. Créez une branche
git checkout -b feature/my-feature develop

# 2. Codez et testez en local
npm test          # Validez localement
npm run lint      # Vérifiez le style

# 3. Poussez vers votre fork/branche
git push origin feature/my-feature

# 4. Ouvrez une Pull Request vers 'develop'
# GitHub Actions lance automatiquement ci-cd.yml

# 5. Attendez le ✅ vert
# (Si ❌, cliquez pour voir quelle étape a échoué)

# 6. Une fois approuvé et fusionné vers main
# deploy.yml RELANCE ci-cd.yml, puis déploie vers Render
```

### Pour les HotFixes

```bash
# Directement sur main (urgent)
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug
# ... codez et testez ...
git push origin hotfix/critical-bug
git push origin main  # ou PR si vous attendez review

# CI/CD auto-valide + Render auto-déploie
```

---

## Optimisations Futures

Une fois que le pipeline est stable:

1. **Ajouter des tests de sécurité (OWASP)**
2. **Coverage minimum (90%+)**
3. **Performance tests** (FCP, LCP)
4. **Automatic minification** (ci-cd.yml build:prod avant Docker)
5. **Staging deployment** avant production
6. **Notifications Slack** des déploiements

---

## Support & Documentation

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Node.js Setup Action](https://github.com/actions/setup-node)
- [Render Deploy Hooks](https://docs.render.com/deploy-hooks)

