# Shade — App mobile

Application mobile (Expo / React Native + expo-router + NativeWind) de copy trading
et de sniping sur Solana. Backend FastAPI + Supabase dans `../service/api`.

## Design system

- Couleurs, espacements, typo et rayons sont tokenisés : variables CSS dans
  [global.css](global.css), exposées en classes Tailwind via [tailwind.config.js](tailwind.config.js).
- Utiliser les tokens plutôt que des valeurs en dur : `bg-cards`, `text-text-secondary`,
  `p-md`, `rounded-lg`, etc. Police `font-satoshi`. Thème sombre (`bg-primary` = `#121418`).
- Icônes : `@expo/vector-icons` (Feather) + icônes SVG de marques dans `components/icons`.

## Espace Éducation (`app/(tabs)/learn`)

- Contenu local et typé dans `content/education` (catégories, leçons en « blocs », glossaire).
  Pour ajouter une leçon : créer son fichier dans `content/education/lessons/` puis
  l'ajouter à `lessons/index.ts`.
- Composants dédiés dans `components/education`.

### Règle impérative : aucun conseil financier

Tout le contenu de l'espace Éducation (et plus largement de l'app) doit rester
**strictement pédagogique et neutre**. Ne jamais :

- recommander d'acheter, vendre ou détenir un actif ;
- prédire l'évolution d'un prix ou présenter un actif comme une opportunité ;
- inciter à pratiquer le copy trading ou le sniping.

Décrire les mécanismes de façon factuelle, mentionner les risques, et rappeler que
toute décision relève de la seule responsabilité de l'utilisateur. Le composant
`Disclaimer` (`components/education`) doit figurer sur l'accueil Éducation et en pied
de chaque leçon.
