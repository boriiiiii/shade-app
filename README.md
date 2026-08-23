# SHADE — bot Solana *copytrade + sniping*, non-custodial, piloté depuis un shell

Projet **étudiant / démo**. Une app React Native (Expo, SDK 54) façon **terminal
Unix** (fond noir, monospace vert phosphore/ambre, curseur clignotant, logs live)
qui pilote un **backend Node.js** de **copytrade** et **sniping** sur Solana via
l'agrégateur **Jupiter**.

> 🔐 **100% non-custodial.** Le backend **ne détient aucune clé**. Il détecte des
> opportunités et **construit des transactions non signées** pour ton wallet
> **Phantom** connecté. **Chaque transaction est signée et envoyée par toi dans
> Phantom** (`signAndSendTransaction`). Les moteurs mettent les ordres en file
> d'attente ; tu **approuves chaque ordre** un par un.

---

## Architecture

```
shade-claude/
├── backend/                 # API REST + WebSocket + moteurs (Node.js + TypeScript)
│   ├── src/
│   │   ├── index.ts         # serveur Express + WebSocket (point d'entrée)
│   │   ├── config.ts        # lecture .env (réseau, RPC, plafonds)
│   │   ├── routes.ts        # routes REST /api/* (wallet, moteurs, ordres)
│   │   ├── orders.ts        # cycle de vie des ordres (create → build → sent → confirm)
│   │   ├── ws.ts            # hub WebSocket (rediffuse logs/état/ordres)
│   │   ├── state.ts         # état global en mémoire (pas de DB)
│   │   ├── solana/
│   │   │   ├── connection.ts# connexion RPC + liens Explorer
│   │   │   ├── wallet.ts    # lecture de solde (AUCUNE clé détenue)
│   │   │   └── jupiter.ts   # quote + construction de tx NON signée + confirmation
│   │   └── engines/
│   │       ├── copytrade.ts # surveille des adresses cibles → crée des ordres
│   │       ├── sniping.ts   # surveille les programmes DEX → crée des ordres
│   │       └── feeder.ts    # (démo) génère de faux événements pour tester le flux
│   └── .env.example
│
├── mobile/                  # App React Native (Expo SDK 54) — interface terminal
│   ├── App.tsx              # onglets + câblage deep links Phantom (connect + sign)
│   └── src/
│       ├── api.ts           # client REST
│       ├── useBotSocket.ts  # hook WebSocket (logs, état, ordres en temps réel)
│       ├── commands.ts      # parseur de commandes (le "shell")
│       ├── wallet/
│       │   ├── phantom.ts   # connexion + signAndSendTransaction (deep links chiffrés)
│       │   └── session.ts   # persistance locale (wallet + session Phantom)
│       ├── panels/          # DashPanel, CopyPanel, SnipePanel, OrdersPanel
│       └── components/       # StatusHeader, TabBar, LogView, CommandBar, ui, Cursor
│
└── package.json            # lance backend + mobile ensemble
```

**Flux d'un trade**

```
 détection (backend)         approbation (app)              signature (Phantom)
 ─────────────────────  ►  ────────────────────────  ►  ──────────────────────
 engine crée un ORDER       tu tapes APPROVE →            Phantom signe + envoie
 (pending, sans tx)         backend build la tx Jupiter    → signature renvoyée
                            pour ton wallet                → app la rapporte au
                            → l'app ouvre Phantom            backend qui confirme
```

- Le **frontend** est un shell : chaque commande/bouton appelle une route REST.
- Le **backend** détecte (`onLogs`) et **construit** des tx non signées. Il ne
  signe rien. Tout est poussé en direct sur le WebSocket → l'app affiche le flux.

---

## Décisions clés

- **Non-custodial** : trading depuis **ton wallet Phantom connecté**. Aucune clé
  côté serveur. Chaque tx est signée à la main dans Phantom.
- **Chaque ordre est confirmé** : détections copytrade/snipe → file d'ordres →
  tu approuves & signes un par un (onglet **ORDERS**).
- **Exécution réelle** via **Jupiter** (`/quote` puis `/swap` avec `userPublicKey`
  = ton wallet) sur mainnet.
- **Demo feeder** : `demo on` génère des détections synthétiques sur des tokens
  liquides (BONK/JUP/WIF) → des ordres réels que tu peux approuver.

---

## Prérequis

- **Node.js 18+** (testé sur Node 22).
- **Expo Go** (SDK 54) sur ton téléphone — nécessaire pour signer via Phantom.
- **Phantom** installé sur le téléphone.
- Idéalement une clé **RPC rapide** (Helius/QuickNode) pour le sniping.

---

## Installation

```bash
npm install                 # deps racine (concurrently)
npm run install:all         # installe backend/ et mobile/
cp backend/.env.example backend/.env
```

---

## Lancer

```bash
npm run dev      # backend + bundler Expo en parallèle
# ou séparément :
npm run backend  # http://localhost:8000 (+ ws://localhost:8000/ws)
npm run mobile   # ouvre Expo — scanne le QR avec Expo Go
```

**Connexion app ↔ backend** : l'URL du backend est **auto-détectée** depuis l'IP
du serveur Metro (donc pas de `localhost` sur téléphone physique). Pour forcer :
```bash
EXPO_PUBLIC_API_URL=http://192.168.1.42:8000 npm run mobile
```
> Le backend **doit tourner** pour construire les tx et voir les soldes.

---

## Utiliser (démo de bout en bout)

1. Onglet **DASH** → **CONNECT PHANTOM** → approuve dans Phantom. Ton adresse +
   solde s'affichent (connexion persistée, indépendante du backend).
2. Onglet **SNIPE** (ou **COPY**) → règle le montant → **START**.
3. **DASH → DEMO FEED** (ou `demo snipe` dans l'onglet TERM) pour générer une
   détection tout de suite.
4. Onglet **ORDERS** → un ordre `AWAITING APPROVAL` apparaît → **APPROVE & SIGN**
   → Phantom s'ouvre → tu signes → l'ordre passe `SENT` puis `CONFIRMED` avec un
   lien **Solana Explorer**.

Shell (onglet **TERM**) : `help`, `connect`, `copy start`, `snipe amount 0.01`,
`buy <mint> 0.01`, `orders`, `demo on`…

---

## Garde-fous (`backend/.env`)

| Variable | Rôle | Défaut |
|---|---|---|
| `MAX_TRADE_SOL` | plafond par ordre | `0.05` |
| `MAX_SLIPPAGE_BPS` | slippage max | `1500` (15%) |
| `SOLANA_NETWORK` | `mainnet-beta` \| `devnet` | `mainnet-beta` |
| `HELIUS_API_KEY` | RPC/WS rapides (dérivés auto) | — |
| `DEMO_FEED` | démarre le feeder au boot | `false` |

Comme **tu signes chaque tx**, aucun trade ne part sans ton approbation explicite.

---

## Limites assumées (démo)

- Détection **heuristique** (deltas de soldes de tokens, marqueurs de logs) — pas
  de décodage exhaustif des instructions Raydium/pump.fun.
- État **en mémoire** (aucune DB) — perdu au redémarrage du backend.
- Achat uniquement (pas de vente / gestion de position).
- La tx est construite à l'approbation ; si tu tardes trop à signer, le blockhash
  peut expirer → il suffit de re-**APPROVE** (RETRY) pour reconstruire une tx fraîche.
- Deep links Phantom implémentés selon le protocole officiel ; le fallback
  `connect <adresse>` (onglet TERM) permet de tester l'UI sans signer.

---

## Police monospace

L'app utilise la monospace native (Menlo/monospace ≈ Courier). Pour bundler
**JetBrains Mono** / **Fira Code** : ajoute le `.ttf` dans `mobile/assets/`,
charge-le avec `expo-font`, puis remplace `MONO` dans `mobile/src/theme.ts`.
