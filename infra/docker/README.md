# infra/docker — environnements

| Fichier | Usage | Particularités |
|---------|-------|----------------|
| [`../../docker-compose.yml`](../../docker-compose.yml) | **dev** (défaut, OrbStack local) | bind-mount du code, `uvicorn --reload`, port Postgres exposé, migrations au boot |
| [`docker-compose.staging.yml`](docker-compose.staging.yml) | **staging** | image buildée (pas de bind-mount), pas de reload, Postgres non exposé publiquement |
| [`docker-compose.prod.yml`](docker-compose.prod.yml) | **prod** | image taggée, secrets via l'orchestrateur, réplication/backup Postgres à externaliser |

## Lancer

```bash
# dev (depuis la racine du repo)
docker compose up --build

# staging
docker compose -f infra/docker/docker-compose.staging.yml --env-file .env.staging up -d --build

# prod
docker compose -f infra/docker/docker-compose.prod.yml --env-file .env.prod up -d
```

## Secrets par environnement
Chaque environnement a son propre fichier d'env **non commité** (`.env`, `.env.staging`,
`.env.prod`) dérivé de [`../../.env.example`](../../.env.example). En prod, préférez un gestionnaire
de secrets (Docker/K8s secrets, Vault…) plutôt qu'un fichier sur disque, notamment pour
`JWT_SECRET` et `SIDE_WALLET_SECRET_KEY`.

> ⚠️ `SIDE_WALLET_SECRET_KEY` est la seule clé privée détenue par Shade. En prod elle doit être en
> secret manager, jamais en clair dans un repo ou une image.
