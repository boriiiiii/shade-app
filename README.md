# Shade — MVP (Solana devnet)

Application mobile **non-custodial** de trading automatisé sur Solana, combinant **copy trading** et
**sniping**. L'utilisateur connecte son wallet, **ne cède jamais sa clé privée**, et délègue une
autorisation *limitée et révocable* au backend, qui exécute des trades en son nom dans des bornes
strictes (budget, durée, slippage max, whitelist).

> Projet étudiant Epitech (EDP). Objectif de cette itération : un MVP **réellement fonctionnel sur
> devnet** — vrais wallets, vraies transactions signées, vrai backend. Pas de données mockées.

## Sommaire

- [Architecture](#architecture)
- [Modèle de confiance non-custodial](#modèle-de-confiance-non-custodial)
- [Les 3 modes d'exécution](#les-3-modes-dexécution)
- [Démarrage rapide](#démarrage-rapide)
- [Structure du repo](#structure-du-repo)
- [API](#api-principaux-endpoints)
- [Tests](#tests)
- [Décisions d'architecture](#décisions-darchitecture)
- [Sécurité](#sécurité--règles-non-négociables)

## Architecture

```
┌────────────────────┐        ┌──────────────────────────┐        ┌─────────────────────┐
│  App mobile (Expo) │  HTTPS │   Backend FastAPI        │  RPC   │  Solana devnet      │
│  React Native      │◀──────▶│   (auth, orders, modes)  │◀──────▶│  spl-token program  │
│  NativeWind        │  JWT   │   PostgreSQL (SQLAlchemy)│        │  System program     │
└─────────┬──────────┘        └───────────┬──────────────┘        └─────────────────────┘
          │                               │
          │ signMessage / signTransaction │ side wallet (délégataire)
          ▼                               ▼  ne peut dépenser QUE le montant approuvé
   Wallet utilisateur              Clé privée du side wallet
   (Phantom / MWA)                 (seule clé détenue par Shade)
   → SEUL détenteur de la
     clé privée de l'utilisateur
```

- **Frontend** : React Native + Expo + NativeWind (`apps/mobile`)
- **Backend** : Python **FastAPI**, SQLAlchemy **async** + Alembic (`services/api`)
- **DB** : PostgreSQL 16 auto-hébergé (conteneur officiel, orchestré via **OrbStack**)
- **Blockchain** : Solana **devnet** — `@solana/web3.js` (client), `solders` / `solana-py` (backend)
- **Délégation** : SPL Token `Approve`/`Revoke` (voir [ADR 0001](docs/architecture-decisions/0001-delegation-mechanism.md))

## Modèle de confiance non-custodial

1. **Délégation** — l'utilisateur signe une instruction SPL `Approve` **dans son wallet** :
   il autorise le *side wallet* du backend à dépenser un **montant précis** d'un **token précis**.
   Jamais la clé privée, jamais un montant illimité.
2. **Révocation** — instruction SPL `Revoke` signée par l'utilisateur, **on-chain**, qui coupe
   l'accès immédiatement, sans dépendre du backend.
3. **Isolation** — le side wallet ne peut toucher **que** le compte de token approuvé, **que** dans
   la limite du montant approuvé. Le SOL natif et tous les autres fonds restent hors de portée.
4. **Défense en profondeur** — à **chaque** exécution (pas seulement à l'approbation), le backend
   re-vérifie statut/durée/budget résiduel/slippage/whitelist/chaîne, **reconstruit** la transaction
   côté serveur, et journalise chaque tentative (`AuditLog`) avec sa raison d'acceptation/rejet.

## Les 3 modes d'exécution

| Mode | Signature | Exécution | Usage |
|------|-----------|-----------|-------|
| **A. Manuel** | Utilisateur signe **chaque** trade dans son wallet | L'utilisateur, via deep link | Copy trading gros volumes / faible volatilité, zéro confiance backend |
| **B. Degen** | 1 `Approve` initial (durée + budget) | Side wallet, tant que `now < expires_at` **et** `spent < budget` | Session temporaire (ex : 2h / 5 SOL) |
| **C. Full Trust** | 1 `Approve` budget dédié | Side wallet 24/7 sur événement on-chain | Sniping, latence quasi nulle |

Détails du flux Order (build → validate → ready-to-sign → sign → broadcast → track) :
voir [`docs/architecture-decisions/0001`](docs/architecture-decisions/0001-delegation-mechanism.md)
et `services/api/app/orders/`.

## Démarrage rapide

### Prérequis
- **OrbStack** (ou Docker) pour Postgres + l'API
- **Node ≥ 18** + `npm` pour l'app Expo
- Python 3.12 (uniquement si tu veux lancer l'API hors Docker)

### 1. Backend + base de données (Docker / OrbStack)

```bash
cp .env.example .env
# Renseigne JWT_SECRET et SIDE_WALLET_SECRET_KEY (voir ci-dessous)
python services/api/scripts/gen_side_wallet.py   # génère une paire devnet + l'airdrop
# → copie la clé affichée dans SIDE_WALLET_SECRET_KEY du .env

docker compose up --build
# API   → http://localhost:8000   (Swagger : http://localhost:8000/docs)
# Health → http://localhost:8000/health
```

Le service `api` attend que Postgres soit *healthy*, applique les migrations Alembic
(`alembic upgrade head`), puis lance uvicorn avec hot-reload.

### 2. App mobile (Expo)

```bash
cd apps/mobile
npm install
cp .env.example .env       # EXPO_PUBLIC_API_URL=http://<ton-ip-locale>:8000
npm run start              # puis 'i' (iOS), 'a' (Android) ou QR code Expo Go
```

> Pour tester le flux non-custodial de bout en bout sans téléphone physique + Phantom, l'app expose
> un **dev signer** devnet (clé locale de test, `EXPO_PUBLIC_DEV_SIGNER=true`, **`__DEV__` only**,
> jamais en prod). Le chemin de production utilise Phantom (deep link) / Mobile Wallet Adapter.

## Structure du repo

```
shade/
├── apps/
│   └── mobile/               # Expo app (React Native + NativeWind)
├── services/
│   └── api/                  # FastAPI backend
│       ├── app/
│       │   ├── auth/         # nonce, vérification signature, JWT
│       │   ├── orders/       # build / validate / ready-to-sign / track
│       │   ├── copytrade/    # sélection trader + config copie
│       │   ├── sniping/      # bot snipe + détection d'événement
│       │   ├── wallet/       # délégation SPL (side wallet)
│       │   ├── solana/       # client RPC + crypto Ed25519
│       │   ├── db/           # modèles SQLAlchemy, session
│       │   └── core/         # config, sécurité
│       ├── alembic/          # migrations
│       └── tests/
├── infra/
│   └── docker/               # variantes compose staging/prod
├── docs/
│   └── architecture-decisions/
└── README.md
```

## API (principaux endpoints)

| Méthode | Route | Description |
|---------|-------|-------------|
| `POST` | `/auth/nonce` | Émet un nonce à signer (usage unique, TTL court) |
| `POST` | `/auth/verify` | Vérifie la signature Ed25519 ↔ adresse, renvoie un JWT |
| `GET`  | `/auth/me` | Profil de la session courante |
| `POST` | `/wallet/delegations/prepare` | Construit la tx `Approve` (à signer côté wallet) |
| `POST` | `/wallet/delegations/confirm` | Enregistre la délégation après broadcast |
| `POST` | `/wallet/delegations/{id}/revoke` | Construit la tx `Revoke` |
| `POST` | `/orders/prepare` | Valide + construit un ordre « ready to sign » |
| `POST` | `/orders/{id}/submit` | (Manuel) broadcast la tx signée par l'utilisateur |
| `POST` | `/orders/{id}/execute` | (Degen/Full Trust) exécution par le side wallet, dans les limites |
| `GET`  | `/orders/{id}` | Statut on-chain (pending/success/failed) |
| `GET`  | `/orders` | Historique + PnL agrégé |
| `POST` | `/copytrade/configs` | Crée/MAJ une config de copy trading |
| `POST` | `/sniping/configs` | Crée/MAJ une config de sniping |
| `POST` | `/sniping/events` | (Simulé devnet) événement « nouveau token » → déclenche l'exécution |

Documentation interactive complète : **`/docs`** (Swagger) une fois l'API lancée.

## Tests

```bash
cd services/api
pip install -r requirements-dev.txt
pytest -q
```

Couverture minimale exigée par le cahier des charges :
- vérification de signature Ed25519 (`tests/test_auth_signature.py`)
- validation d'ordre **côté serveur** (`tests/test_order_validation.py`)
- respect des limites **budget / durée** en Mode Degen (`tests/test_degen_limits.py`)

## Décisions d'architecture
- [ADR 0001 — Mécanisme de délégation non-custodial](docs/architecture-decisions/0001-delegation-mechanism.md)
- [Diagrammes de flux — Login & Order](docs/flows.md)

## Sécurité — règles non négociables
- Aucune clé privée utilisateur ne transite ni n'est stockée côté Shade, **jamais**.
- Le nonce de login est **usage unique** + **expiration courte** (anti-rejeu).
- **Toute** transaction est reconstruite et validée côté backend (montant, route, slippage max,
  whitelist token/DEX, chaîne) avant d'être proposée à la signature.
- Budget et durée du side wallet sont vérifiés **à chaque exécution**, pas seulement à l'approbation.
- **Audit log** sur chaque tentative (acceptée ou rejetée), avec la raison.

## Licence
Open-source-ready : pas de secret en dur, `.env` propre. À compléter selon la politique EDP.
