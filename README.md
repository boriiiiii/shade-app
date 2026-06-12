# Shade

Application mobile de trading automatisé sur Solana.

Shade permet aux utilisateurs de copier les stratégies de traders experts
et d'automatiser leurs entrées sur de nouveaux tokens, sans expertise 
technique requise.

> Projet en cours de développement — EDP Epitech Digital School 2024-2025

## Concept

Le copy trading et le sniping sont des pratiques répandues dans la crypto,
mais les outils existants restent complexes et peu accessibles.
Shade propose une interface mobile intuitive pour démocratiser ces usages.

## Fonctionnalités prévues

- Connexion wallet et onboarding simplifié
- Classement des traders avec historique de performance (ROI, winrate)
- Copy trading automatique — copier les trades d'un expert en un clic
- Sniping — bot d'achat instantané sur les nouveaux tokens
- Tableau de bord portefeuille (positions, gains, frais)
- Système de commissions entre traders et abonnés

## Stack

| Composant | Technologie |
|-----------|-------------|
| Mobile | React Native · Expo · TypeScript |
| Backend | FastAPI · Python |
| Blockchain | Solana |

## Structure
shade-app/
├── shade-app/     # Application mobile
└── service/
├── api/       # API FastAPI
└── worker-solana/  # Worker blockchain

## Statut

Projet en développement actif — non fonctionnel en l'état.

## Tests

### Lancer les suites

```bash
# Frontend (Jest + jest-expo/node) — 39 tests, ~6 s
cd shade-app && bun run test

# Backend (pytest + FastAPI TestClient) — 79 passants + 5 skip documentés, ~0.5 s
cd service/api && source venv/bin/activate && python -m pytest tests/ -v
```

Aucun appel réseau n'est effectué : Jupiter, Solana RPC et Supabase sont
intégralement mockés.

### Ce que les tests prouvent (et ce qu'ils ne prouvent pas)

La couverture suit une **pyramide de tests**. Chaque niveau attrape des bugs
que les autres laissent passer — aucun ne remplace les autres.

#### Niveau 0 — Tests unitaires (présents aujourd'hui)

Ce qu'ils vérifient : les **contrats individuels** des modules.

| Suite | Couvre |
|-------|--------|
| `shade-app/__tests__/jupiter.test.ts` | conversions SOL ↔ lamports, URL/params Jupiter, retry sur 5xx, slippage par défaut |
| `shade-app/__tests__/api.test.ts` | wrapper backend `getSwapTransactionViaBackend`, `getSolanaSignatures`, `getSolanaTransaction`, `authWithWallet` — shape des requêtes, propagation d'erreur, **invariant blob non-signé** |
| `shade-app/__tests__/phantom.test.ts` | round-trip `serializeSecret/deserializeSecret`, déchiffrement nacl d'un payload Phantom forgé, broadcast via `Connection` mockée |
| `shade-app/__tests__/crypto.test.ts` | `shortenAddress`, dégradation gracieuse des balances ETH/MATIC/SOL sur RPC fail |
| `service/api/tests/test_main.py` | `/swap/transaction` happy path + erreurs Jupiter + invariant "réponse non-signée", proxy `/solana/*`, smoke Supabase pour `/auth/wallet` et `/health` |
| `service/api/tests/test_permit.py` | nouvelle délégation Manual/Degen/FullTrust, expiration, révocation, cap budgétaire |
| `service/api/tests/test_storage.py` | atomicité de la consommation, **20 threads concurrents → exactement 10 succès sur un budget de 1000 / 100 lamports** |
| `service/api/tests/test_engine.py` | dry-run consomme le budget, swap réel refusé sans burn |
| `service/api/tests/test_crypto.py` | AES-GCM round-trip, détection de tampering, master key manquante |
| `service/api/tests/test_router.py` | flux REST `/sniping/*` end-to-end |

Ce qu'ils n'attrapent pas : un produit cassé malgré tous les contrats verts.
Exemple : `lib/jupiter` envoie `slippageBps=300` correctement, mais
`copytrading.tsx` lui passe `parseInt(slippage)` (3) au lieu de
`parseInt(slippage) * 100` (300) → l'unitaire reste vert, le produit slippe
100× plus.

#### Niveau 1 — Fixtures Solana mainnet (à implémenter)

Ce qu'il vérifierait : la **détection de swaps sur le vrai monde**, pas sur
un cas inventé.

- Capturer 5-10 transactions réelles via `getTransaction` (Jupiter, Raydium,
  pump.fun ; buy SOL→token, sell token→SOL, multi-hop).
- Extraire `extractSwap` de `copytrading.tsx` vers `lib/swap-detector.ts`
  (refactor de ~30 lignes).
- Tests `extractSwap(fixture) → {inputMint, outputMint, inputAmount}`.

Bugs typiques qu'il attraperait : `preTokenBalances` undefined sur wallet
neuf, swap pump.fun mal classé à cause d'un programme d'init, multi-hop pris
pour un swap simple. **Coût : ~2 h. ROI : très élevé pour le copy trading.**

#### Niveau 2 — E2E devnet sans Phantom (à implémenter quand `engine.try_snipe(dry_run=False)` sera prêt)

Ce qu'il vérifierait : **la chaîne backend tient sur une vraie blockchain**.

- 2 keypairs server-side (`Keypair.generate()`), airdrop SOL devnet.
- Le test fait un swap réel depuis le wallet A.
- Le polling backend détecte le trade.
- La copie est construite via `getSwapTransactionViaBackend`, signée côté
  test (bypass Phantom), broadcastée, signature confirmée on-chain.

Bugs typiques : ATA manquant, slippage trop tight sur pool illiquide,
blockhash expiré, `wrapAndUnwrapSol` mal géré. **Coût : ~1 jour. ROI :
critique avant la prod.**

#### Niveau 3 — E2E UI (Detox / Maestro)

Ce qu'il vérifierait : **l'orchestration React des écrans**
(`copytrading.tsx`, `snipe.tsx`).

- Detox rend l'écran sur simulateur iOS.
- Stub de `Linking.openURL` pour intercepter le deep-link Phantom et
  injecter une réponse signée pré-calculée.
- Vérifie : le polling tourne, le bouton Copy enchaîne backend → Phantom,
  l'état React reflète l'erreur Phantom proprement.

Limite dure : **Phantom mobile ne se scripte pas**. Le tap réel "Approve"
reste manuel. Au niveau 3 on stube le deep-link, on ne teste pas Phantom.
**Coût : 2-3 jours setup + maintenance permanente. À différer.**

### Trous documentés (`tests/test_missing_coverage.py`)

Cinq `pytest.skip` honnêtes au lieu de faux greens :

1. **Mode Degen / Full Trust execution** — `engine.try_snipe(dry_run=False)`
   est un stub qui lève `SnipeError("real swap path not implemented yet")`
   (`engine.py:38`). Aujourd'hui ces deux modes sont couverts uniquement sur
   leur cap budgétaire / état actif.
2. **Worker Solana 24/7** — `service/worker-solana/` est un dossier vide.
   Aucun processus backend ne polle ni n'exécute en autonomie.
3. **Notification push Manual mode** — le backend n'a pas d'endpoint push.
   Le polling est fait côté front directement sur `/solana/signatures`. Le
   "mode Manuel : détection → notification → signature" du pitch est en
   réalité 100 % côté client.
4. **STRUCTURAL BUG : `/swap/transaction` sans permit** — la route construit
   la transaction de swap sans valider le moindre permit. Le pare-feu actuel
   est uniquement la signature Phantom côté client. Le module permit du
   backend n'est consulté nulle part dans cette route. À corriger avant la
   prod.
5. **`extractSwap` non testable en l'état** — inlined dans
   `copytrading.tsx:73`. Nécessite une extraction de fonction pure pour
   passer en Niveau 1.

### Convention

- Format pytest : `test_<module>.py`, fixtures via `conftest.py`.
- Format Jest : `__tests__/<module>.test.ts`, mocks dans `jest.setup.ts`.
- Mocks externes obligatoires : aucun socket ne doit s'ouvrir pendant la
  suite. Si un test demande devnet/mainnet, il appartient au Niveau 2 ou 3
  et doit vivre dans un dossier séparé (`tests/e2e/`).
- Aucun faux green : si un test ne peut pas être écrit faute de code métier,
  il vit en `pytest.skip` ou `test.skip` avec **la raison + file:line de la
  pièce manquante**.