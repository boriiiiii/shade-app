# Shade - Monorepo

Ce repository contient l'ensemble du projet Shade:

## Structure

```
shade/
├── shade-app/          # Application mobile React Native (Expo)
└── service/            # Services backend
    ├── api/            # API FastAPI
    └── worker-solana/  # Worker Solana
```

## Développement

### Frontend (shade-app)
```bash
cd shade-app
npm install
npm start
```

### Backend (service/api)
```bash
cd service/api
pip install -r requirements.txt
uvicorn main:app --reload
```
