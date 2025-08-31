# La Perle Rouge - Gestion de Café Restaurant

Application de gestion complète pour café-restaurant avec support web et desktop (Electron).

## 🚀 Fonctionnalités

### 📊 Gestion Complète
- **Dashboard** avec métriques en temps réel
- **Commandes** et gestion des tables
- **Produits** et inventaire
- **Agents** et suivi du temps  
- **Revenus** et rapports financiers
- **Factures** avec impression thermique
- **Profils** utilisateurs et gestion des droits

### 🖨️ Impression Thermique
- Support imprimantes ESC/POS (RONGTA RP330, etc.)
- Impression via Web Serial API (navigateurs)
- Impression via Electron (application desktop)
- Génération automatique de tickets clients/agents
- Découpe automatique du papier

### 🔐 Sécurité
- Authentification utilisateur
- Contrôle d'accès basé sur les rôles
- Routes protégées (admin/agent)
- Chiffrement des données sensibles

## 🛠️ Technologies

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + Shadcn/ui
- **Routing**: React Router (HashRouter pour Electron)  
- **Desktop**: Electron avec sécurité renforcée
- **Build**: Electron Builder pour distribution

## 📦 Installation

### Prérequis
- Node.js 18+ ou Bun
- Git

### Installation des Dépendances

#### Avec NPM (Recommandé pour Electron)
```bash
git clone <votre-repo>
cd la-perle-rouge
npm install
npm install electron electron-builder wait-on --save-dev
```

#### Avec Bun (Mode Web uniquement)
```bash
git clone <votre-repo>
cd la-perle-rouge
bun install
```

**Note**: Pour Electron, NPM est recommandé car certaines dépendances natives nécessitent une compilation spécifique.

## 🚀 Développement

### Mode Web (Développement)
```bash
# Avec Bun
bun run dev

# Avec NPM
npm run dev
```
Application accessible sur: http://localhost:8080

### Mode Electron (Desktop)
```bash
# Démarrer en mode développement Electron
npm run electron:dev
```

Ajoutez ces scripts à votre `package.json`:
```json
{
  "scripts": {
    "electron:dev": "node scripts/electron-dev.js",
    "electron:build": "node scripts/build-electron.js"
  }
}
```

## 📦 Build et Distribution

### Build Web
```bash
# Build pour production web
npm run build
```

### Build Desktop (Electron)
```bash
# Build application desktop
npm run electron:build
```

Cette commande:
1. Build l'application React
2. Package l'application Electron
3. Crée les installateurs pour votre plateforme

### Distribution Multi-Plateformes
L'application peut être compilée pour:
- **Windows**: .exe, installateur NSIS, version portable
- **macOS**: .dmg, .app
- **Linux**: AppImage, .deb

## 🖨️ Configuration Imprimante Thermique

### Navigateur Web
1. Connectez votre imprimante ESC/POS via USB
2. Utilisez un navigateur compatible (Chrome/Edge)
3. Autorisez l'accès Web Serial API quand demandé

### Application Desktop
1. L'application détecte automatiquement les ports série
2. Configuration automatique pour imprimantes RONGTA
3. Support étendu des commandes ESC/POS

### Imprimantes Testées
- RONGTA RP330 series
- Compatible ESC/POS standard
- Port série/USB

## 📁 Structure du Projet

```
la-perle-rouge/
├── electron/                 # Fichiers Electron
│   ├── main.js              # Processus principal
│   └── preload.js           # Script de préchargement
├── scripts/                 # Scripts de build
│   ├── electron-dev.js      # Dev Electron
│   └── build-electron.js    # Build Electron
├── src/
│   ├── components/          # Composants React
│   ├── pages/              # Pages de l'application
│   ├── services/           # Services métier
│   ├── utils/              # Utilitaires
│   │   ├── escposUtils.ts  # Gestion imprimante
│   │   └── electronUtils.ts # Intégration Electron
│   └── types/              # Types TypeScript
├── public/                 # Assets statiques
├── dist/                   # Build web
├── dist-electron/          # Build desktop
└── electron-builder.config.js # Config Electron Builder
```

## 🔧 Configuration

### Routing pour Electron
L'application utilise `HashRouter` au lieu de `BrowserRouter` pour compatibilité Electron:

```typescript
// App.tsx
import { HashRouter as Router } from 'react-router-dom';
```

### Configuration Electron
- `electron-builder.config.js`: Configuration de build desktop
- `electron/main.js`: Fenêtre principale et sécurité
- `electron/preload.js`: API sécurisée renderer ↔ main

## 🛡️ Sécurité

### Web
- HTTPS recommandé en production
- Validation côté client et serveur
- Gestion sécurisée des sessions

### Desktop (Electron)
- Context isolation activée
- Node integration désactivée
- Preload script sécurisé
- Protection contre XSS/injection

## 📱 Compatibilité

### Navigateurs
- Chrome 89+ (Web Serial API)
- Edge 89+
- Firefox (impression fallback)
- Safari (impression fallback)

### Systèmes d'Exploitation
- Windows 10/11 (x64, x86)
- macOS 10.15+ (Intel, Apple Silicon)
- Linux Ubuntu 18.04+ (x64)

## 🐛 Dépannage

### Problèmes d'Installation Electron
```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install
npm install electron electron-builder wait-on --save-dev

# Alternative avec Yarn
yarn install
yarn add electron electron-builder wait-on --dev
```

### Problèmes de Build
```bash
# Rebuild des modules natifs
npm run electron:rebuild
# ou
yarn electron:rebuild
```

### Impression Thermique
1. Vérifiez la connexion USB/série
2. Testez avec un autre navigateur
3. Redémarrez l'imprimante
4. Vérifiez les pilotes système

## 🚀 Scripts Package.json

Ajoutez ces scripts à votre `package.json`:

```json
{
  "main": "electron/main.js",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "electron:dev": "node scripts/electron-dev.js",
    "electron:build": "node scripts/build-electron.js",
    "electron:rebuild": "electron-rebuild"
  }
}
```

## 📄 Licence

Copyright © 2024 La Perle Rouge. Tous droits réservés.

---

**Développé avec ❤️ pour La Perle Rouge**