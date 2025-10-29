# 📱 Guide Complet - Shade App

## 📋 Table des Matières
1. [Git - Cloner & Contribuer](#-git---cloner--contribuer)
2. [Structure du Projet](#-structure-du-projet)
3. [Logger - Système de Logs](#-logger---système-de-logs)
4. [Modifier les Couleurs](#-modifier-les-couleurs)
5. [Modifier les Espacements](#-modifier-les-espacements)
6. [Bonnes Pratiques](#-bonnes-pratiques)

---

## 🔧 Git - Cloner & Contribuer

### 1️⃣ Cloner le Projet

```bash
# Cloner le repository
git clone https://github.com/boriiiiii/shade-app.git

# Aller dans le dossier
cd shade-app

# Installer les dépendances
bun install
# ou
npm install
```

### 2️⃣ Créer sa Branche

**Important** : Ne jamais travailler directement sur `main` !

```bash
# Créer et aller sur une nouvelle branche
git checkout -b nom-de-ta-branche

# Exemples de noms de branches :
git checkout -b feature/nouvelle-page
git checkout -b fix/bug-wallet
git checkout -b ui/modifier-couleurs
```

**Convention de nommage** :
- `feature/` → Pour ajouter une nouvelle fonctionnalité
- `fix/` → Pour corriger un bug
- `ui/` → Pour modifier l'interface

### 3️⃣ Modifier le Code

Fais tes modifications (voir sections suivantes)

### 4️⃣ Vérifier les Changements

```bash
# Voir les fichiers modifiés
git status

# Voir les modifications en détail
git diff
```

### 5️⃣ Commit & Push

```bash
# Ajouter tous les fichiers modifiés
git add .

# Faire un commit avec un message clair
git commit -m "type: description claire de ce que tu as fait"

# Convention de commit :
# feat:     → Nouvelle fonctionnalité
# fix:      → Correction de bug
# docs:     → Modification de documentation
# style:    → Changement visuel (couleurs, CSS)
# refactor: → Réorganisation du code (sans changer le comportement)
# chore:    → Maintenance/nettoyage (supprimer fichiers inutiles)
# test:     → Ajout de tests
# perf:     → Amélioration de performance

# Exemples de messages :
git commit -m "feat: ajout de la page profil"
git commit -m "fix: correction du bug de connexion wallet"
git commit -m "docs: mise à jour du guide de contribution"
git commit -m "style: changement de la couleur principale en bleu"
git commit -m "refactor: simplification de la logique d'authentification"
git commit -m "chore: suppression des fichiers inutilisés"
git commit -m "feat: ajout du bouton Phantom wallet"

# Envoyer sur GitHub
git push origin nom-de-ta-branche
```

---

## 📁 Structure du Projet

### 📂 `app/` - Les Pages de l'Application

**Ce dossier contient toutes les pages accessibles dans l'app.**

```
app/
├── _layout.tsx          # Layout global de l'app
├── index.tsx            # Page d'accueil (première page)
├── login.tsx            # Page de connexion
├── sign_up.tsx          # Page d'inscription
├── welcome.tsx          # Page de bienvenue avec wallets
├── profile.tsx          # Page profil utilisateur
├── settings.tsx         # Page paramètres
└── (tabs)/              # Pages dans la navbar (voir ci-dessous)
    ├── _layout.tsx      # Layout de la navbar
    ├── index.tsx        # Onglet Home
    └── explore.tsx      # Onglet Explore
```

**Comment ça marche ?**
- Chaque fichier `.tsx` dans `app/` = une page de l'app
- Pour créer une nouvelle page : ajoute un fichier `ma-page.tsx`
- Pour y accéder : `router.push('/ma-page')`

### 📂 `app/(tabs)/` - Les Pages de la Navbar

**Ce dossier spécial contient les pages qui apparaissent dans la barre de navigation en bas.**

```
(tabs)/
├── _layout.tsx     # Configuration de la navbar (icônes, ordre, etc.)
├── index.tsx       # Premier onglet (Home)
└── explore.tsx     # Deuxième onglet (Explore)
```

**Pourquoi `(tabs)` ?**
- Les parenthèses `()` = dossier de route dans Expo Router
- Permet d'avoir une navbar fixe en bas avec plusieurs onglets

**Différence app/ vs app/(tabs)/** :
- `app/welcome.tsx` → Page normale (pas dans la navbar)
- `app/(tabs)/index.tsx` → Page dans la navbar (onglet visible)

### 📂 Autres Dossiers

```
components/           # Composants réutilisables (boutons, cards, etc.)
├── wallet-button.tsx
├── icons/           # Tous les SVG/icônes
└── welcome/         # Composants de la page welcome

lib/                 # Utilitaires et helpers
├── constants.ts     # Constantes (espacements, URLs, etc.)
└── logger.ts        # Système de logs

assets/             # Images, fonts, etc.
├── fonts/
└── images/

types/              # Types TypeScript
```

---

## 🔍 Logger - Système de Logs

### Qu'est-ce que le Logger ?

Le logger est un **système de débogage** qui permet de suivre ce qui se passe dans l'app.

**Fichier** : `lib/logger.ts`

### À quoi ça sert ?

✅ **Déboguer** : Comprendre pourquoi quelque chose ne marche pas

✅ **Suivre le flow** : Voir l'ordre d'exécution du code

✅ **Catcher les erreurs** : Identifier les problèmes rapidement

### Comment l'utiliser ?

```tsx
import { logger } from '@/lib/logger';

// Log d'information
logger.info("L'utilisateur a cliqué sur le bouton");
logger.info("Connexion wallet initiée", { walletName: "Coinbase" });

// Log de débogage (détails techniques)
logger.debug("Valeur de la variable", { value: myVariable });

// Log d'avertissement
logger.warn("Cette fonctionnalité est obsolète");

// Log d'erreur
logger.error("Échec de connexion", error);
```

### Types de Logs

| Type | Quand l'utiliser | Exemple |
|------|-----------------|---------|
| `logger.debug()` | Informations techniques détaillées | `logger.debug("API response", response)` |
| `logger.info()` | Événements importants | `logger.info("User logged in")` |
| `logger.warn()` | Quelque chose d'anormal mais pas bloquant | `logger.warn("Slow network detected")` |
| `logger.error()` | Erreurs et crashs | `logger.error("Failed to load data", error)` |

### Où voir les logs ?

**Dans le terminal** où tu as lancé `bun start` :

```
[INFO] User clicked on Coinbase wallet
[DEBUG] Wallet connection params { walletName: 'Coinbase', network: 'mainnet' }
[ERROR] Connection failed Error: Network timeout
```

### Exemple Pratique

```tsx
// Dans un composant
const handleWalletConnect = (walletName: string) => {
  logger.info("Wallet connection initiated", { walletName });
  
  try {
    // Logique de connexion
    connectWallet(walletName);
    logger.info("Wallet connected successfully", { walletName });
  } catch (error) {
    logger.error("Wallet connection failed", { walletName, error });
  }
};
```

**Résultat dans le terminal** :
```
[INFO] Wallet connection initiated { walletName: 'Coinbase' }
[INFO] Wallet connected successfully { walletName: 'Coinbase' }
```


## 🎨 Modifier les Couleurs

### Où ? `global.css`

**Toutes les couleurs de l'app sont centralisées ici.**

```css
:root {
  /* Couleurs principales */
  --color-primary: #121418;        /* Fond principal de l'app */
  --color-secondary: #6283FA;      /* Bleu (boutons, accents) */
  --color-accent: #4D4D4D;         /* Gris foncé */
  --color-cards: #2A2A2A;          /* Fond des cartes/boutons */
  
  /* Couleurs de texte */
  --color-text-primary: #FFFFFF;   /* Texte blanc */
  --color-text-secondary: #BFBFBF; /* Texte gris clair */
  --color-text-muted: #6B6B6B;     /* Texte gris foncé */
  
  /* Couleurs de validation */
  --color-validation: #58FAAE;     /* Vert (succès) */
  --color-invalidation: #FA7272;   /* Rouge (erreur) */
  --color-novalidation: #FF6A00;   /* Orange (warning) */
}
```

### Comment les modifier ?

**✅ BONNE PRATIQUE** : Modifier dans `global.css`

```css
/* Changer le bleu en rouge */
--color-secondary: #FF0000;

/* Changer le fond en plus clair */
--color-primary: #1A1A1A;
```

**❌ MAUVAISE PRATIQUE** : Ne jamais mettre de couleur en dur dans le code

```tsx
// ❌ NE PAS FAIRE
<View style={{ backgroundColor: '#FF0000' }}>

// ✅ FAIRE
<View className="bg-secondary">
```

### Utiliser les Couleurs dans le Code

**Avec Tailwind** (méthode recommandée) :

```tsx
<View className="bg-primary">         {/* Fond principal */}
<View className="bg-secondary">       {/* Fond secondaire */}
<View className="bg-cards">           {/* Fond carte */}

<Text className="text-primary">       {/* Texte blanc */}
<Text className="text-secondary">     {/* Texte gris clair */}
<Text className="text-muted">         {/* Texte gris foncé */}
```

### Exemple Complet

```tsx
// Avant : tout en bleu
<TouchableOpacity className="bg-secondary h-wallet-btn rounded-lg">
  <Text className="text-primary">Connexion</Text>
</TouchableOpacity>

// Après : changer en violet
// 1. Modifier global.css
--color-secondary: #8B5CF6;

// 2. Le code reste le même, la couleur change automatiquement !
<TouchableOpacity className="bg-secondary h-wallet-btn rounded-lg">
  <Text className="text-primary">Connexion</Text>
</TouchableOpacity>
```

## 📏 Modifier les Espacements

### Où ? `global.css`

```css
:root {
  /* Espacements */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  /* Padding de l'app */
  --app-padding-horizontal: 21px;  /* Marge gauche/droite */
  --app-padding-vertical: 21px;    /* Marge haut/bas */
  --app-padding-top: 60px;         /* Marge du haut */
}
```

### Utiliser les Espacements dans le Code

**Avec Tailwind** :

```tsx
<View className="p-md">          {/* Padding 16px */}
<View className="m-lg">          {/* Margin 24px */}
<View className="px-app-h">      {/* Padding horizontal de l'app */}
<View className="pt-app-top">    {/* Padding top de l'app */}
<View className="gap-sm">        {/* Gap entre enfants 8px */}
```

### Modifier les Espacements

**Exemple : Augmenter l'espacement global**

```css
/* global.css - Avant */
--app-padding-horizontal: 21px;

/* global.css - Après */
--app-padding-horizontal: 30px;
```

Tous les écrans avec `px-app-h` auront maintenant 30px de marge !

### Exemple Pratique

```tsx
// Créer une carte avec espacements cohérents
<View className="bg-cards rounded-lg p-md m-sm">
  <Text className="text-primary mb-sm">Titre</Text>
  <Text className="text-secondary">Description</Text>
</View>
```

**Résultat** :
- Fond gris foncé
- Coins arrondis
- 16px de padding interne
- 8px de marge externe
- 8px entre le titre et la description

## ✅ Bonnes Pratiques

### 🎨 Couleurs

**✅ FAIRE** :
```tsx
<View className="bg-primary">
<Text className="text-secondary">
```

**❌ NE PAS FAIRE** :
```tsx
<View style={{ backgroundColor: '#121418' }}>
<Text style={{ color: '#BFBFBF' }}>
```

### 📏 Espacements

**✅ FAIRE** :
```tsx
<View className="p-md gap-sm">
```

**❌ NE PAS FAIRE** :
```tsx
<View style={{ padding: 16, gap: 8 }}>
```

### 🔍 Logger

**✅ FAIRE** :
```tsx
logger.info("Action importante", { data });
logger.error("Erreur", error);
```

**❌ NE PAS FAIRE** :
```tsx
console.log("Action importante");  // Moins propre
alert("Erreur");                   // À éviter
```

### 📝 Structure de Fichier

**✅ Ordre recommandé** :

```tsx
// 1. Imports
import { View, Text } from 'react-native';
import { logger } from '@/lib/logger';

// 2. Types/Interfaces
interface Props { ... }

// 3. Composant
export default function MaPage() {
  // 4. States et variables
  const [state, setState] = useState();
  
  // 5. Fonctions
  const handleClick = () => {
    logger.info("Click");
  };
  
  // 6. Render
  return (
    <View className="bg-primary">
      ...
    </View>
  );
}
```

### 🔄 Avant de Push

**Checklist** :
- [ ] Les logs sont présents pour les actions importantes
- [ ] Pas de couleurs en dur (`#FF0000`)
- [ ] Pas d'espacements en dur (`padding: 16`)
- [ ] Le code compile sans erreur (`npx tsc --noEmit`)
- [ ] L'app fonctionne (`bun start`)
- [ ] Message de commit clair


## � Commandes Utiles

```bash
# Lancer l'app
bun start

# Vérifier les erreurs TypeScript
npx tsc --noEmit

# Voir les branches
git branch

# Changer de branche
git checkout nom-branche

# Récupérer les dernières modifications
git pull origin main

# Annuler tous les changements
git checkout .
```


## 📚 Ressources

- **Expo Router** : [docs.expo.dev/router](https://docs.expo.dev/router/)
- **NativeWind** : [nativewind.dev](https://www.nativewind.dev/)
- **Tailwind CSS** : [tailwindcss.com](https://tailwindcss.com/)

---

*Si tu casses quelque chose → `git checkout .` pour tout annuler.*
