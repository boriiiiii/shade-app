# Flux Shade — Login & Order

Diagrammes de séquence des deux flux critiques du MVP. Ils reflètent le code de `services/api`.

## Flux Login (auth wallet, non-custodial)

```mermaid
sequenceDiagram
    participant U as Utilisateur (wallet)
    participant App as App Shade (Expo)
    participant API as Backend FastAPI
    participant DB as PostgreSQL

    App->>API: POST /auth/nonce { wallet_address }
    API->>DB: INSERT auth_nonces (nonce, message, expires_at, used=false)
    API-->>App: { nonce, message, expires_at }
    App->>U: demande signature du `message`
    U-->>App: signature Ed25519 (clé privée jamais exposée)
    App->>API: POST /auth/verify { wallet_address, nonce, signature }
    API->>DB: SELECT auth_nonces WHERE nonce
    API->>API: nonce non utilisé + non expiré ? (anti-rejeu)
    API->>API: verify_signature(address, message_stocké, signature)
    API->>DB: nonce.used = true ; UPSERT users ; INSERT sessions (jti)
    API-->>App: { access_token (JWT), user }
    App->>API: GET /auth/me (Authorization: Bearer)
    API->>DB: session (jti) non révoquée ?
    API-->>App: profil utilisateur
```

Points de sécurité :
- La signature est vérifiée contre le **message exact stocké** (pas de reconstruction côté serveur).
- Le nonce est **usage unique** (`used=true` dès la vérification) et **à expiration courte**.
- Seules l'adresse publique, la chaîne, les préférences et les métadonnées de session sont stockées.

## Flux Order (build → validate → ready-to-sign → broadcast → track)

```mermaid
sequenceDiagram
    participant U as Utilisateur (wallet)
    participant App as App Shade
    participant API as Backend FastAPI
    participant SW as Side wallet (delegate)
    participant SOL as Solana devnet

    App->>API: POST /orders/prepare { mode, mints, amount, slippage, ... }
    API->>API: validate_order_request() — chaîne, whitelist, slippage max, montants
    API->>API: (degen/full_trust) check_delegation_limits() — statut, durée, budget
    API->>API: reconstruit la tx côté serveur ; min_output recalculé
    API->>DB: INSERT orders (status=ready_to_sign) ; AuditLog(accepted)
    API-->>App: { order_id, status=ready_to_sign, unsigned_tx? }

    alt Mode Manuel
        App->>U: signer la transaction
        U-->>App: tx signée
        App->>API: POST /orders/{id}/submit { signed_tx }
        API->>SOL: sendRawTransaction
    else Mode Degen / Full Trust
        App->>API: POST /orders/{id}/execute
        API->>API: check_delegation_limits() À NOUVEAU (défense en profondeur)
        API->>SW: signe la tx déléguée (dans la limite approuvée)
        SW->>SOL: sendRawTransaction
        API->>DB: delegation.amount_spent += montant
    end

    API->>DB: order.status=pending ; tx_signature ; AuditLog
    API-->>App: order (pending, signature)
    loop suivi
        App->>API: GET /orders/{id}
        API->>SOL: getSignatureStatuses
        API-->>App: status = success | failed (+ raison) | pending
    end
```

Points de sécurité :
- La transaction est **toujours reconstruite et revalidée côté serveur** avant signature.
- En Degen/Full Trust, les bornes (durée, budget résiduel) sont revérifiées **à l'exécution**, pas
  seulement à l'approbation.
- Chaque tentative (acceptée ou rejetée) est journalisée dans `AuditLog` avec sa raison.
- L'échec on-chain (slippage dépassé, gas insuffisant, refus) est remonté via `failure_reason`.
