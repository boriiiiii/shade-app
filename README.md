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