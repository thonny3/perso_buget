# 🔧 Guide de Résolution des Problèmes de Connexion

## ❌ Erreur: ERR_NETWORK

Cette erreur indique que l'application mobile ne peut pas se connecter au serveur backend.

### 🚀 Solutions à essayer dans l'ordre :

#### 1. **Vérifier que le backend est démarré**
```bash
cd backend
npm start
```
Le serveur doit afficher : `Server running on port 3000`

#### 2. **Tester la connectivité depuis l'app**
1. Ouvrez l'app mobile
2. Appuyez sur "🔧 Debug" (bouton rouge en bas à droite)
3. Appuyez sur "🔄 Tester Connexion"
4. Regardez les résultats des tests d'URLs

#### 3. **URLs testées automatiquement :**
- `http://10.0.2.2:3000/api` (Android Emulator standard)
- `http://localhost:3000/api` (Alternative)
- `http://127.0.0.1:3000/api` (Alternative locale)

#### 4. **Si toutes les URLs échouent :**

**Pour Android Emulator :**
- Redémarrez l'émulateur
- Vérifiez que le port 3000 est ouvert
- Essayez de changer l'URL dans `config/apiConfig.js`

**Pour iOS Simulator :**
- Utilisez `http://localhost:3000/api`
- Vérifiez que le serveur écoute sur toutes les interfaces

**Pour device physique :**
- Trouvez votre IP locale : `ipconfig` (Windows) ou `ifconfig` (Mac/Linux)
- Utilisez `http://VOTRE_IP:3000/api` dans `config/apiConfig.js`

#### 5. **Vérifications supplémentaires :**

**Backend :**
- Le serveur écoute-t-il sur le port 3000 ?
- Y a-t-il des erreurs dans les logs du serveur ?
- Le CORS est-il configuré pour accepter les requêtes mobiles ?

**Réseau :**
- Le pare-feu bloque-t-il le port 3000 ?
- L'émulateur a-t-il accès à Internet ?
- L'IP 10.0.2.2 est-elle accessible depuis l'émulateur ?

### 📱 Utilisation des outils de debug :

1. **Logs en temps réel :**
   - Appuyez sur "📋 Logs" pour voir tous les logs
   - Filtrez par type (ERROR, WARN, LOG)

2. **Test de connectivité :**
   - Appuyez sur "🔧 Debug" pour tester les URLs
   - Regardez les résultats détaillés

3. **Configuration :**
   - Vérifiez `config/apiConfig.js`
   - Modifiez l'URL si nécessaire

### 🆘 Si rien ne fonctionne :

1. **Redémarrez tout :**
   - Fermez l'émulateur
   - Arrêtez le serveur backend
   - Redémarrez l'émulateur
   - Redémarrez le serveur backend
   - Relancez l'app

2. **Vérifiez les logs :**
   - Logs du serveur backend
   - Logs de l'émulateur
   - Logs de l'app mobile (bouton "📋 Logs")

3. **Testez avec un navigateur :**
   - Ouvrez `http://localhost:3000/api/health` dans votre navigateur
   - Si ça marche, le problème vient de la configuration mobile

### 📞 Support :

Si le problème persiste, fournissez :
- Les logs de l'app (bouton "📋 Logs")
- Les résultats des tests de connectivité (bouton "🔧 Debug")
- Le système d'exploitation et la version de l'émulateur
- Les logs du serveur backend
