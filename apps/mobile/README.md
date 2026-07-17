# Shade — app mobile (Expo)

Front React Native + Expo + NativeWind, câblé sur le backend FastAPI (`../../services/api`).
Ton **fintech sobre** : fond encre, un accent émeraude, espaces généreux, zéro code « degen ».

## Lancer

```bash
npm install
cp .env.example .env        # EXPO_PUBLIC_API_URL = http://<ip>:8000, EXPO_PUBLIC_DEV_SIGNER=true
npm run start               # puis i (iOS), a (Android) ou QR Expo Go
npm run typecheck           # tsc --noEmit
```

> Backend requis en parallèle : `docker compose up` à la racine (voir le README racine).
> Depuis un **téléphone physique**, mets l'IP locale de ta machine dans `EXPO_PUBLIC_API_URL`
> (pas `localhost`). Émulateur Android : `http://10.0.2.2:8000`.

## Signature du wallet : deux chemins

| Adapter | Quand | Statut |
|---------|-------|--------|
| **Dev signer** (`lib/wallet/devWallet.ts`) | `__DEV__` **et** `EXPO_PUBLIC_DEV_SIGNER=true` | ✅ pleinement fonctionnel — clé de test locale (tweetnacl), signe le message de login et signe/diffuse les tx sur devnet. Badge « DEV SIGNER » visible. |
| **Phantom** (`lib/wallet/phantomWallet.ts`) | Build de prod (flag off) | ✅ protocole deep-link **chiffré** complet (connect / signMessage / signTransaction / signAndSendTransaction). Nécessite un build standalone/dev enregistré sous le schéma `shade://` + Phantom sur un vrai device — **ne peut pas** boucler dans Expo Go (qui possède le schéma `exp://`). |

Les deux respectent le principe non-custodial : **la clé privée de production ne quitte jamais
Phantom**. Le dev signer est une exception de test, jamais embarquée en production.

## Architecture

```
app/
  _layout.tsx            # AuthProvider + garde de navigation + relais deep-link Phantom
  (auth)/connect.tsx     # onboarding + connexion wallet (nonce → signature → JWT)
  (app)/_layout.tsx      # tabs : Accueil / Copie / Sniping / Ordres (+ delegate caché)
  (app)/index.tsx        # dashboard : side wallet, délégations, PnL, accès modes
  (app)/delegate.tsx     # créer / confirmer / révoquer une délégation (SPL Approve)
  (app)/copytrade.tsx    # traders, config de copie, simulation de trade copié
  (app)/sniping.tsx      # config bot full_trust + simulation d'événement nouveau token
  (app)/orders.tsx       # ordre manuel (SOL→wSOL), liste + actions (signer/exécuter/suivre)
lib/
  api/                   # client typé + types miroir des schémas FastAPI
  auth/AuthContext.tsx   # session, login/logout, adapter courant
  wallet/                # WalletAdapter (dev + phantom) + sélection
  format.ts, theme.ts, env.ts, storage.ts, errors.ts
components/ui/           # design system (Button, Card, Input, Badge, StatTile, Screen…)
```

## Flux non-custodial de bout en bout (dev signer)
1. **Connexion** — `connect` → `POST /auth/nonce` → signature du message → `POST /auth/verify` → JWT.
2. **Délégation** — `POST /wallet/delegations/prepare` → signer l'Approve → `…/confirm`.
3. **Ordre manuel** — `POST /orders/prepare` → signer la tx → `POST /orders/{id}/submit`.
4. **Degen / Full Trust** — l'ordre est exécuté par le side wallet (`POST /orders/{id}/execute`).
5. **Suivi** — `GET /orders/{id}` rafraîchit le statut on-chain ; explorer devnet cliquable.
