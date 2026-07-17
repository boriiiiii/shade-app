# Shade — raccourcis de développement.
# `make help` pour la liste.

API_DIR := services/api
MOBILE_DIR := apps/mobile
VENV := $(API_DIR)/.venv
PY := $(VENV)/bin/python

.DEFAULT_GOAL := help

.PHONY: help
help: ## Affiche cette aide
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'

# ---- Docker / OrbStack (stack complète : api + postgres) ----
.PHONY: up
up: ## Lance la stack dev (docker compose : api + postgres)
	docker compose up --build

.PHONY: down
down: ## Arrête la stack dev
	docker compose down

.PHONY: logs
logs: ## Suit les logs de l'API
	docker compose logs -f api

# ---- Backend (hors docker) ----
.PHONY: api-install
api-install: ## Crée le venv et installe les deps backend (dev)
	cd $(API_DIR) && python3 -m venv .venv && . .venv/bin/activate && \
		pip install -q --upgrade pip && pip install -q -r requirements-dev.txt

.PHONY: api-test
api-test: ## Lance les tests backend (pytest)
	cd $(API_DIR) && . .venv/bin/activate && pytest -q

.PHONY: api-run
api-run: ## Lance l'API en local (SQLite, sans docker)
	cd $(API_DIR) && . .venv/bin/activate && \
		DATABASE_URL="sqlite+aiosqlite:///./_dev.db" uvicorn app.main:app --reload --port 8000

.PHONY: gen-wallet
gen-wallet: ## Génère un side wallet devnet + airdrop (colle la clé dans .env)
	cd $(API_DIR) && . .venv/bin/activate && python scripts/gen_side_wallet.py

.PHONY: migrate
migrate: ## Applique les migrations Alembic (utilise DATABASE_URL de l'env)
	cd $(API_DIR) && . .venv/bin/activate && alembic upgrade head

# ---- Frontend (Expo) ----
.PHONY: mobile-install
mobile-install: ## Installe les deps de l'app mobile
	cd $(MOBILE_DIR) && npm install

.PHONY: mobile-start
mobile-start: ## Démarre Expo (QR / simulateurs)
	cd $(MOBILE_DIR) && npm run start
