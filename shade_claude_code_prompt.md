# Prompt Claude Code — Shade MVP (Solana devnet)

Colle ce prompt tel quel dans Claude Code à la racine d'un nouveau repo vide.

---

## Contexte produit

Shade est une application mobile **non-custodial** de trading automatisé pour l'écosystème Solana/DeFi, combinant **copy trading** et **sniping**. L'utilisateur connecte son wallet, ne perd jamais le contrôle de sa clé privée, et délègue une autorisation *limitée* à un backend qui exécute des trades en son nom selon des règles strictes (budget, durée, slippage max, listes blanches).

C'est un projet étudiant (Epitech EDP), mais l'objectif de cette itération est un **MVP fonctionnel sur Solana devnet** : vrais wallets, vraies transactions signées, vrai backend — pas une maquette avec données mockées.

## Stack imposée

- **Frontend mobile** : React Native + Expo, NativeWind (Tailwind pour RN)
- **Backend** : Python FastAPI
- **Base de données** : PostgreSQL auto-hébergé (conteneur `postgres` classique, pas de service managé type Supabase), orchestré en local via **OrbStack**. Utilise SQLAlchemy (async) + Alembic pour les migrations côté FastAPI.
- **Blockchain** : Solana (devnet pour le MVP), via `@solana/web3.js` côté client et `solana-py` / `solders` côté backend
- **Wallet integration** : Mobile Wallet Adapter (MWA) pour Android/iOS, ou deep link vers Phantom — pas de gestion de clé privée côté Shade, jamais
- **Infra** : Docker, environnements dev/staging/prod séparés
- **Philosophie** : code open-source-ready (pas de secrets en dur, `.env` propre, README clair)

## Décision d'architecture à trancher AVANT de coder (important)

Les documents produit utilisent un vocabulaire "Permit/Approve" hérité d'EVM, qui **n'existe pas nativement sur Solana**. Avant d'écrire du code, propose et documente explicitement l'un de ces trois mécanismes de délégation (ou une combinaison), avec les trade-offs sécurité/complexité :

1. **SPL Token `Approve`/`Revoke`** : le wallet principal délègue un montant précis d'un token (ex: USDC/wrapped SOL) à une adresse "side wallet" contrôlée par le backend. Simple, mais délégation par token individuel, pas par montant SOL natif directement (SOL natif n'a pas de délégation SPL — il faut soit wrapper SOL en wSOL, soit passer par un programme custom).
2. **Programme Solana custom (PDA vault)** : un programme on-chain qui reçoit un dépôt limité + des règles (durée, budget, slippage max) stockées on-chain, et que seul le backend peut invoquer dans ces limites. Plus robuste et plus proche de l'esprit "Mode Degen / Full Trust" du doc produit, mais demande d'écrire et déployer un programme Anchor.
3. **Session keys éphémères** : une clé de session générée côté app, autorisée on-chain pour une durée/budget limités (proche du modèle des jeux Solana). Bon compromis vitesse de dev / sécurité réelle.

**Recommandation à valider avec moi avant implémentation** : pour un MVP devnet en délai contraint, partir sur l'option 1 (SPL delegate) pour le Mode Manuel + Mode Degen, et poser l'option 2 (programme Anchor) comme évolution documentée mais non bloquante pour le rendu. Si tu (Claude Code) vois une meilleure option compte tenu des libs Solana actuelles, propose-la avant de commencer à coder — ne code pas silencieusement sur une hypothèse.

## Les 3 modes d'exécution (spec fonctionnelle imposée)

### A. Mode Manuel
- Usage : copy trading sur actifs peu volatils / gros volumes
- Flux : détection d'opportunité → notification push → ouverture Shade → deep link vers le wallet → signature manuelle par l'utilisateur à chaque trade
- Avantage : contrôle total, zéro confiance envers le backend
- Inconvénient : latence élevée, slippage potentiel

### B. Mode Degen (session temporaire)
- L'utilisateur définit une durée (ex: 2h) et un budget max (ex: 5 SOL)
- Il signe une transaction d'approbation initiale (mécanisme choisi ci-dessus)
- Le "side wallet" backend exécute et signe les trades automatiquement tant que temps et budget ne sont pas dépassés

### C. Mode Full Trust (obligatoire pour le sniping)
- Approbation permanente d'un budget dédié
- Exécution 24/7 par le backend dès qu'un événement on-chain pertinent est détecté (nouveau token qui liste, trade d'un trader copié)
- Latence quasi nulle

### Architecture de confiance
1. **Délégation** : l'utilisateur autorise le side wallet à dépenser un montant précis depuis son wallet principal — jamais la clé privée
2. **Révocation** : révocable à tout moment on-chain par l'utilisateur, coupe l'accès immédiatement
3. **Isolation** : les fonds non approuvés du wallet principal restent techniquement inaccessibles au backend

## Fonctionnalités du MVP (5 capacités, dans cet ordre de priorité)

1. **Auth wallet (diagramme Login)** — connexion via deep link/MWA, preuve de possession par signature d'un nonce, jamais de clé privée stockée. Le backend émet le nonce, vérifie signature ↔ adresse, crée/MAJ le profil, renvoie un JWT de session. Seules sont stockées en base : adresse publique, chaîne, préférences, métadonnées de session, abonnement.
2. **Copy trading** — sélection d'un trader modèle, paramétrage (taille de position, budget/plafonds, slippage toléré, whitelist de tokens/routes, fréquence d'exécution)
3. **Sniping** — activation bot avec détection d'événement (nouveau token), contraintes de latence, limites de risque, routage
4. **Exécution d'ordre (diagramme Order)** — l'app ne signe et n'exécute JAMAIS localement ni côté serveur sans passage par le wallet : paramétrage → confirmation intention → backend reconstruit et valide l'ordre (montants, route, slippage max, whitelist, chaîne) → renvoie "ordre prêt à signer" → deep link vers wallet → signature exclusivement dans le wallet → diffusion on-chain → backend suit l'état (pending/success/failed) via écoute d'événements → affichage confirmation avec hash ou échec contextualisé (slippage dépassé, gas insuffisant, refus de signature)
5. **Suivi** — état des ordres en temps réel, historique, PnL agrégé, notifications

## Ce qui n'est PAS dans ce MVP (ne pas construire, ne pas sur-scoper)
- Multi-chain EVM (post-MVP uniquement, mentionné mais hors périmètre)
- Take profit / stop loss automatiques, règles conditionnelles avancées (post-MVP)
- Sections analytics/veille poussées, alertes on-chain avancées (post-MVP)
- Vrai programme Anchor on-chain si l'option 1 (SPL delegate) est retenue — documente juste la voie d'évolution
- Paiement/facturation réel (le modèle de frais existe dans les docs business mais n'a pas besoin d'être implémenté en devnet)

## Exigences de sécurité non négociables

- Aucune clé privée ne transite ni n'est stockée côté Shade, à aucun moment
- Le nonce de login empêche le rejeu (usage unique, expiration courte)
- Toute transaction est reconstruite et validée côté backend (montant, route, slippage max, whitelist token/DEX, chaîne correcte) avant d'être proposée à la signature — jamais de confiance aveugle dans ce que le client envoie
- Le budget et la durée du side wallet sont vérifiés à chaque exécution, pas seulement à l'approbation initiale
- Logs d'audit sur chaque tentative d'exécution (acceptée ou rejetée), avec raison de rejet

## Structure de repo attendue

```
shade/
├── apps/
│   └── mobile/              # Expo app (React Native + NativeWind)
├── services/
│   └── api/                 # FastAPI backend
│       ├── app/
│       │   ├── auth/        # nonce, signature verification, JWT
│       │   ├── orders/      # order build/validate/track
│       │   ├── copytrade/
│       │   ├── sniping/
│       │   ├── wallet/      # side wallet delegation logic
│       │   └── db/          # SQLAlchemy models, session, Alembic migrations
│       └── tests/
├── infra/
│   └── docker/               # docker-compose dev/staging/prod
├── docs/
│   └── architecture-decisions/  # ADR pour le choix du mécanisme de délégation
└── README.md
```

## Ce que je veux que tu fasses, dans cet ordre

1. Propose et documente (fichier `docs/architecture-decisions/0001-delegation-mechanism.md`) le mécanisme de délégation retenu (SPL delegate recommandé, avec plan d'évolution vers programme Anchor). Attends ma validation avant de continuer si tu identifies un risque bloquant.
2. Scaffold le repo avec la structure ci-dessus, un `docker-compose.yml` pour dev (service `api` FastAPI + service `postgres` officiel, volumes persistants, healthcheck), pensé pour tourner sous **OrbStack** en local (pas de dépendance à un service cloud managé), et un `.env.example` complet (`DATABASE_URL`, secrets JWT, RPC Solana devnet, etc.).
3. Implémente le flux Auth complet (diagramme Login) : endpoint nonce, vérification signature Ed25519 Solana, création session/JWT, modèles SQLAlchemy + migration Alembic pour `users`/`sessions`.
4. Implémente le flux Order (diagramme Order) : construction, validation, préparation "ready to sign", tracking on-chain (polling ou websocket sur le statut de la transaction devnet), gestion des cas d'échec.
5. Implémente le Mode Manuel de bout en bout sur devnet (le plus simple, sert de socle) avant d'attaquer Degen/Full Trust.
6. Implémente Mode Degen (délégation temporaire avec budget/durée) puis Mode Full Trust (déclenchement sniping sur événement on-chain).
7. Frontend Expo : écrans onboarding/connexion wallet, dashboard, paramétrage copy trading, paramétrage sniping, suivi d'ordres — via NativeWind, cohérent avec un ton "fintech sobre, clair, digne de confiance" (pas de codes agressifs "crypto degen").
8. Écris les tests (au minimum : vérification signature, validation d'ordre côté serveur, respect des limites de budget/durée en Mode Degen).

Pose-moi des questions si un point de sécurité ou d'architecture n'est pas clair — ne fais pas d'hypothèse silencieuse sur la gestion des clés ou la validation des ordres, c'est le cœur de la confiance non-custodial du produit.
