# Guide Docker Compose - Test Local Avant Render

## Vue d'ensemble

Docker Compose vous permet de tester votre application complète localement avec la **même configuration** qu'elle aura sur Render.

**Avantages:**
- ✅ Tester avant de pousser vers Render (zéro risque)
- ✅ Reproduire exatement l'environnement production
- ✅ Dépistage des problèmes de port, variables d'env, dépendances
- ✅ Valider SMTP et email avant production
- ✅ Tester la scalabilité (lancer plusieurs instances)

---

## Prérequis

### Installer Docker & Docker Compose

**Windows (WSL2 recommandé):**
```bash
# Télécharger Docker Desktop
# https://www.docker.com/products/docker-desktop

# Vérifier installation
docker --version          # Docker version 20+
docker-compose --version  # v2.0+
```

**macOS:**
```bash
brew install docker-compose
```

**Linux:**
```bash
sudo apt update && sudo apt install docker.io docker-compose
sudo usermod -aG docker $USER
newgrp docker
```

---

## Démarrage Rapide

### 1. Vérifier la Structure

```
barakahbrain/
├── docker-compose.yml      ← Main configuration
├── nginx.conf              ← Web server config
├── BarakahBrain/           ← Frontend (HTML/CSS/JS)
├── BarakahBrain-API/       ← Backend (Node.js)
│   ├── server.js
│   ├── package.json
│   └── Dockerfile
└── .env                    ← Variables d'env
```

### 2. Créer le fichier .env

```bash
cd c:\Users\ORIGINAL\Desktop\barakahbrain

# Créer .env avec les variables
cat > .env << EOF
# Obligatoires
JWT_SECRET=dev-secret-must-be-changed-in-production
INIT_ADMIN_PWD=admin123456

# SMTP (optionnel, pour tester email)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-mailtrap-inbox-id@inbox.mailtrap.io
SMTP_PASS=your-mailtrap-token
SMTP_FROM=noreply@barakahbrain.local
EOF
```

### 3. Démarrer les Conteneurs

```bash
# Lancer en mode normal
docker-compose up

# Ou en mode détaché (background)
docker-compose up -d

# Voir les logs en temps réel
docker-compose logs -f api
docker-compose logs -f nginx
```

**Attendre la sortie:**
```
api_1   | Server running on port 3000 ✅
nginx_1 | [notice] master process started
```

### 4. Tester l'Application

**Frontend:**
```
http://localhost    (Nginx reverse proxy)
ou
http://localhost:80/index.html
```

**API Direct:**
```bash
# Health check
curl http://localhost:3000/api/health

# Ou avec Postman
GET http://localhost:3000/api/health
```

**Résultat attendu:**
```json
{
  "status": "ok",
  "timestamp": "2024-11-23T..."
}
```

---

## Arrêter les Conteneurs

```bash
# Option 1: Arrêter mais garder les données
docker-compose stop

# Option 2: Arrêter + supprimer conteneurs
docker-compose down

# Option 3: Arrêter + supprimer data (reset complet)
docker-compose down -v
```

---

## Configuration Personnalisée

### Modifier les Ports

**docker-compose.yml:**
```yaml
services:
  api:
    ports:
      - "3001:3000"    # Écouter sur 3001 localement, 3000 dans le container
  
  nginx:
    ports:
      - "8080:80"      # Frontend sur port 8080 (si 80 occupé)
```

### Modifier les Variables d'env

**Option 1: Fichier .env**
```bash
echo "JWT_SECRET=your-custom-secret" >> .env
```

**Option 2: Ligne de commande**
```bash
JWT_SECRET=custom docker-compose up
```

### Activer le Hot-Reload (Développement)

**docker-compose.yml** (ajouter sous `api.volumes`):
```yaml
volumes:
  - ./BarakahBrain-API/src:/app/src    # Code source en temps réel
  - ./BarakahBrain:/usr/share/nginx/html:ro  # Frontend
```

Puis relancer:
```bash
docker-compose down
docker-compose up
```

---

## Tester SMTP Email

### Avec Mailtrap (Gratuit, Recommandé)

1. **S'inscrire:** https://mailtrap.io

2. **Créer une "Inbox"** (gratuit)

3. **Copier les credentials:**
   - SMTP Host: `smtp.mailtrap.io`
   - SMTP Port: `587`
   - Username: `[vortra-id]@inbox.mailtrap.io`
   - Password: `[api-token]`

4. **Ajouter au .env:**
```bash
SMTP_USER=1234567@inbox.mailtrap.io
SMTP_PASS=your-api-token
```

5. **Redémarrer**
```bash
docker-compose restart api
```

6. **Test: Appeler l'endpoint de réinitialisation de mot de passe**
```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'
```

7. **Vérifier l'email dans Mailtrap**
   - Ouvrir https://mailtrap.io → Inbox
   - Voir l'email de réinitialisation

---

## Vérifier les Logs

```bash
# Logs du backend
docker-compose logs api

# Logs du web server
docker-compose logs nginx

# Logs en temps réel
docker-compose logs -f

# Logs d'un conteneur spécifique
docker-compose logs -f api | grep "error"
```

---

## Dépannage

### "Cannot reach http://localhost"

```bash
# Vérifier que les conteneurs tournent
docker-compose ps

# Si "Exit", voir pourquoi
docker-compose logs

# Restart
docker-compose restart
```

### "Port 80 already in use"

```bash
# Option 1: Utiliser un port différent
docker-compose.yml, modifier:
  nginx:
    ports:
      - "8080:80"
      
docker-compose up -d
# Accéder à http://localhost:8080

# Option 2: Arrêter le service occupant le port
# Windows:
netstat -ano | findstr :80
taskkill /PID <PID> /F

# macOS/Linux:
lsof -i :80
kill -9 <PID>
```

### "API not responding"

```bash
# Vérifier que le backend démarre
docker-compose logs api | head -20

# Problèmes courants:
# 1. JWT_SECRET manquant → ajouter à .env
# 2. Base de données: vérifier les permissions
# 3. Port 3000 occupé → docker-compose.yml: ports: "3001:3000"
```

### "Nginx 502 Bad Gateway"

API non accessible depuis Nginx. Solutions:
```bash
# 1. Vérifier que l'API tourne:
docker-compose ps

# 2. Tester connexion API directe:
docker exec barakahbrain-api curl -f http://localhost:3000/api/health

# 3. Vérifier nginx.conf:
docker-compose logs nginx
```

---

## Scénarios Avancés

### 1. Tester avec PostgreSQL (Futur)

```yaml
# docker-compose.yml

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: barakah
      POSTGRES_PASSWORD: secure-pwd
      POSTGRES_DB: barakahbrain
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - barakahbrain-network

  api:
    environment:
      DATABASE_URL: postgresql://barakah:secure-pwd@postgres:5432/barakahbrain
```

### 2. Tester la Performance

```bash
# Installer Apache Bench
sudo apt install apache2-utils

# Test: 1000 requêtes, 100 concurrentes
ab -n 1000 -c 100 http://localhost/api/health
```

### 3. Tester HTTPS Localement

```bash
# Générer certificat auto-signé
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# Ajouter à nginx.conf (décommenter la section HTTPS)
# Redémarrer
docker-compose restart nginx
```

### 4. Exporter comme Image Docker Hub

```bash
# Construire
docker build -t barakahbrain-api:latest BarakahBrain-API

# Tagger
docker tag barakahbrain-api:latest username/barakahbrain-api:latest

# Pousser vers Docker Hub
docker login
docker push username/barakahbrain-api:latest
```

---

## Avant de Déployer sur Render

**Checklist:**

- [ ] `docker-compose up` démarre sans erreur
- [ ] Frontend accessible à http://localhost
- [ ] API répond à http://localhost:3000/api/health
- [ ] Connexion fonctionnelle (login/register)
- [ ] Quiz fonctionnel (soumettre réponses)
- [ ] SMTP teste avec succès (allez sur /forgot-password)
- [ ] Pas d'erreurs dans les logs (`docker-compose logs`)
- [ ] Données persistent après `docker-compose restart`
- [ ] Pas de secrets en dur dans le code (tout en .env)

Si tout passe ✅ → Poussez vers GitHub avec confiance, Render fonctionnera identiquement!

---

## Nettoyage Complet

```bash
# Si vous voulez une réinitialisation complète:
docker-compose down -v      # Supprime conteneurs + volumes
docker system prune -a      # Supprime images non utilisées
docker volume prune         # Supprime volumes orphelins
docker-compose up           # Redémarrer fresh
```

---

## Support & Documentation

- [Docker Compose Docs](https://docs.docker.com/compose)
- [Dockerfile Reference](https://docs.docker.com/engine/reference/builder)
- [Multi-container networking](https://docs.docker.com/compose/networking)

