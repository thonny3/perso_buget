# Guide de Débogage - Connexion Mobile ↔ Backend

## Problèmes Identifiés et Solutions

### 1. Configuration API Mobile

**Problème** : L'application mobile ne peut pas se connecter au backend.

**Solutions appliquées** :
- ✅ Configuration de l'URL de base pour le réseau local : `http://192.168.1.28:3002/api`
- ✅ Utilisation de l'IP du réseau local pour tous les environnements
- ✅ Configuration du backend pour écouter sur toutes les interfaces (`0.0.0.0`)
- ✅ Résolution du conflit de ports (port 3002 au lieu de 8081)

### 2. Backend Configuration

**Problème** : Le backend n'était accessible que depuis localhost.

**Solutions appliquées** :
- ✅ Modification du serveur pour écouter sur `0.0.0.0:8081` au lieu de `localhost:8081`
- ✅ Configuration CORS pour autoriser toutes les origines
- ✅ Ajout d'endpoints de test (`/api/ping`, `/api/health`, `/api/auth/test`)

### 3. Base de Données

**Statut** : ✅ Fonctionnelle
- Connexion réussie à MySQL
- 8 utilisateurs présents
- Tables principales existantes

### 4. Outils de Débogage Ajoutés

#### ConnectionDebugger Component
- Interface de débogage intégrée dans l'app mobile
- Tests automatiques de connectivité
- Affichage des résultats en temps réel
- Accessible via le bouton "🔍 Debug Connexion" (mode développement uniquement)

#### Tests Inclus
1. **Configuration API** - Vérification des URLs
2. **Ping Test** - Test de connectivité de base
3. **Health Check** - Vérification de l'état du serveur
4. **Auth Test** - Test des endpoints d'authentification
5. **Login Test** - Test de connexion avec credentials
6. **AuthService Test** - Test du service d'authentification

## Instructions d'Utilisation

### 1. Démarrer le Backend
```bash
cd backend
node index.js
```
Le serveur doit afficher : `Server running on http://0.0.0.0:8081`

### 2. Démarrer l'Application Mobile
```bash
cd mobile_jalako
npm start
# ou
expo start
```

### 3. Utiliser le Débogueur
1. Ouvrir l'application mobile
2. Cliquer sur "🔍 Debug Connexion" (visible seulement en mode développement)
3. Cliquer sur "🚀 Lancer les tests"
4. Analyser les résultats

## URLs de Test

### Backend (réseau local - tous les appareils)
- Ping : `http://192.168.1.28:3002/api/ping`
- Health : `http://192.168.1.28:3002/api/health`
- Auth Test : `http://192.168.1.28:3002/api/auth/test`
- Login : `http://192.168.1.28:3002/api/auth/login`

## Résolution des Problèmes Courants

### Problème : "Network Error" ou "Connection Refused"
**Solutions** :
1. Vérifier que le backend est démarré
2. Vérifier l'IP de la machine (peut avoir changé)
3. Mettre à jour l'URL dans `apiConfig.js`
4. Vérifier le firewall Windows

### Problème : "404 Not Found"
**Solutions** :
1. Vérifier que l'URL de base est correcte
2. Vérifier que le backend écoute sur le bon port
3. Tester avec les endpoints de test

### Problème : "CORS Error"
**Solutions** :
1. Le backend est configuré pour autoriser toutes les origines
2. Vérifier que le serveur est bien démarré
3. Redémarrer le backend si nécessaire

### Problème : "Database Connection Error"
**Solutions** :
1. Vérifier que MySQL est démarré
2. Vérifier les credentials dans `config/db.js`
3. Exécuter `node test-db-connection.js` pour diagnostiquer

## Configuration Recommandée

### Pour le Développement
```javascript
// apiConfig.js
// Configuration pour le réseau local
return 'http://192.168.1.28:3002/api';
```

### Pour la Production
```javascript
// apiConfig.js
return 'https://votre-domaine.com/api';
```

## Logs Utiles

### Backend
- Connexions : `Connecté à la base jalako`
- Requêtes : Logs automatiques dans la console
- Erreurs : Affichées dans la console

### Mobile
- Configuration : `debugApiConfig()` dans la console
- Requêtes : Logs détaillés dans `apiService.js`
- Erreurs : Affichées dans le ConnectionDebugger

## Prochaines Étapes

1. ✅ Tester la connexion avec le débogueur
2. ✅ Vérifier que les endpoints fonctionnent
3. ✅ Tester l'authentification
4. ✅ Vérifier la récupération des données
5. 🔄 Optimiser les performances si nécessaire

## Support

Si les problèmes persistent :
1. Vérifier les logs du backend
2. Utiliser le ConnectionDebugger
3. Tester avec des outils comme Postman
4. Vérifier la configuration réseau
