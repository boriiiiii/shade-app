# ADR 0001 — Mécanisme de délégation non-custodial (Solana devnet)

- **Statut** : Accepté
- **Date** : 2026-07-18
- **Décideurs** : Équipe Shade (EDP) — validé avec le porteur produit
- **Contexte technique** : MVP Solana **devnet**, backend FastAPI, wallet mobile (MWA / Phantom deep link)

## Contexte

Les documents produit héritent d'un vocabulaire EVM (« Permit », « Approve », « side wallet »)
qui n'a **pas d'équivalent 1:1 sur Solana**. Solana n'a pas de standard `permit` signé off-chain
comme EIP-2612. Nous devons choisir explicitement *comment* un utilisateur autorise le backend
(le « side wallet ») à exécuter des trades **sans jamais lui confier sa clé privée**, tout en
gardant la révocation on-chain immédiate et l'isolation des fonds non-approuvés.

Trois options ont été étudiées (voir prompt produit) :

| # | Option | Force | Faiblesse |
|---|--------|-------|-----------|
| 1 | **SPL Token `Approve`/`Revoke`** | Natif, aucun programme à déployer, révocation on-chain standard, testable immédiatement sur devnet | Délègue **par mint SPL**, pas le SOL natif (il faut wrapper en wSOL) ; les règles (durée/budget) sont vérifiées **off-chain** par le backend |
| 2 | **Programme Anchor (PDA vault)** | Règles (durée, budget, slippage) **on-chain**, dépôt isolé dans un PDA, le plus proche de « Full Trust » | Il faut écrire, auditer, déployer et maintenir un programme Anchor → coût/délai/risque élevés pour un MVP |
| 3 | **Session keys éphémères** | Bon compromis vitesse/sécurité, modèle éprouvé (jeux Solana) | Tooling moins standard, révocation et bornage budget/durée à ré-implémenter, surface de sécurité custom |

## Décision

**Nous retenons l'option 1 — SPL Token `Approve`/`Revoke`** pour le MVP devnet (Modes Manuel,
Degen et Full Trust), avec l'option 2 (programme Anchor PDA vault) **documentée comme évolution
non-bloquante**.

### Justification

- **Délai / risque** : aucune écriture ni déploiement de programme on-chain. On s'appuie sur le
  `spl-token` program déjà déployé sur devnet → time-to-MVP minimal.
- **Non-custodial strict** : l'instruction `Approve` est **signée exclusivement dans le wallet de
  l'utilisateur**. Shade ne voit jamais la clé privée. Le backend ne détient que la clé de son
  *side wallet* (le délégataire), qui ne peut dépenser **que** le montant approuvé du token
  approuvé, et **rien** au-delà.
- **Révocation on-chain immédiate** : `Revoke` est une instruction SPL standard signée par
  l'utilisateur ; elle coupe l'accès du délégataire instantanément, sans dépendre du backend.
- **Isolation** : le délégataire ne peut toucher **que** le compte de token (ATA) explicitement
  approuvé et **seulement** à hauteur du montant approuvé. Le SOL natif et tout autre token du
  wallet principal restent techniquement hors de portée.

### SOL natif → wSOL

Le SOL natif n'a pas de délégation SPL. Pour déléguer du « SOL », l'utilisateur **wrap** son SOL en
**wSOL** (`So1111...1112`) dans son propre ATA, puis `Approve` le side wallet sur ce compte wSOL.
Le flux de délégation (Mode Degen / Full Trust) enchaîne donc côté wallet utilisateur :
`create ATA wSOL (si absent)` → `transfer/sync SOL→wSOL` → `Approve(delegate = side_wallet, amount = budget_max)`,
le tout dans **une transaction signée par l'utilisateur**. Pour un budget en USDC (devnet), on saute
l'étape wrap et on `Approve` directement l'ATA USDC.

### Où sont vérifiées les règles (durée / budget / slippage / whitelist) ?

Comme l'option 1 ne stocke pas les règles on-chain, **le backend est l'unique gardien** et applique
une **défense en profondeur** (voir `docs/architecture-decisions` + code `app/wallet` & `app/orders`) :

1. La délégation on-chain plafonne le **montant absolu** dépensable (garde-fou dur, on-chain).
2. Le backend enregistre en base `amount_max`, `amount_spent`, `expires_at`, `mode`, `status`.
3. **À chaque exécution** (pas seulement à l'approbation) le backend re-vérifie :
   `status == active`, `now < expires_at`, `amount_spent + montant <= amount_max`, slippage ≤ max,
   token & DEX dans la whitelist, chaîne = devnet. Tout rejet est journalisé (`AuditLog`) avec sa
   raison.
4. La transaction est **reconstruite et revalidée côté serveur** avant signature — jamais de
   confiance aveugle dans le payload client.

> ⚠️ **Limite assumée du MVP** : entre deux exécutions, l'allowance on-chain reste au montant
> approuvé ; le respect **durée** et **budget résiduel** dépend du backend. C'est acceptable en
> devnet et pour un MVP, et c'est précisément ce que l'option 2 rend « trustless ». La révocation
> utilisateur reste, elle, toujours on-chain et souveraine.

## Conséquences

### Positives
- MVP livrable rapidement, 100 % testable sur devnet avec de vraies transactions signées.
- Révocation souveraine on-chain, indépendante du backend.
- Aucune surface de programme custom à auditer pour ce rendu.

### Négatives / dette assumée
- Les bornes durée/budget-résiduel sont *policy backend*, pas *consensus on-chain* → confiance
  partielle envers le backend entre deux trades (mitigée par audit-log + révocation + montant
  plafonné on-chain).
- Étape `wrap SOL → wSOL` supplémentaire côté UX.

## Plan d'évolution (option 2 — non bloquant pour le rendu)

Programme Anchor **`shade_vault`** :

- L'utilisateur dépose un budget dans un **PDA vault** (`seeds = [b"vault", owner, mode]`).
- Les règles (`budget_max`, `expires_at`, `slippage_max_bps`, `token_whitelist`) sont stockées
  **on-chain** dans le compte vault.
- Seule une instruction `execute_trade(...)` signée par le side wallet **et** validée par les
  contraintes on-chain peut dépenser → bornes **trustless**.
- `revoke()` / `withdraw()` signées par l'owner rendent les fonds et ferment le vault.

Migration : le backend expose déjà une interface `DelegationBackend` (`app/wallet/service.py`).
Passer de SPL delegate au vault Anchor = fournir une nouvelle implémentation de cette interface,
sans toucher aux routers `orders`/`copytrade`/`sniping`.

## Références
- SPL Token `Approve` / `Revoke` : https://spl.solana.com/token
- wSOL (Native Mint) : `So11111111111111111111111111111111111111112`
- Anchor : https://www.anchor-lang.com/
