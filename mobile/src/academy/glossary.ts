import { GlossaryTerm, GlossaryTheme } from "./types";

/**
 * Thèmes de regroupement du glossaire (utilisés par le filtre).
 */
export const GLOSSARY_THEMES: GlossaryTheme[] = [
  { id: "fondamentaux", label: "Fondamentaux" },
  { id: "securite", label: "Wallets & sécurité" },
  { id: "trading", label: "Trading" },
  { id: "defi-nft", label: "DeFi & NFT" },
];

/**
 * Glossaire crypto — définitions neutres et pédagogiques.
 * Trié alphabétiquement à l'affichage. Chaque terme porte un thème.
 */
export const GLOSSARY: GlossaryTerm[] = [
  {
    term: "Adresse",
    definition:
      "Identifiant public d'un wallet, dérivé de la clé publique, utilisé pour recevoir des fonds.",
    theme: "securite",
  },
  {
    term: "Airdrop",
    definition:
      "Distribution gratuite de tokens à un ensemble d'adresses, souvent pour récompenser ou faire connaître un projet.",
    theme: "defi-nft",
  },
  {
    term: "Bridge",
    definition:
      "Outil permettant de transférer des actifs d'une blockchain à une autre.",
    theme: "defi-nft",
  },
  {
    term: "Blockchain",
    definition:
      "Registre numérique partagé et ordonné qui enregistre les transactions de façon difficilement falsifiable.",
    theme: "fondamentaux",
  },
  {
    term: "CEX",
    definition:
      "« Centralized Exchange » : plateforme d'échange gérée par une société, qui conserve les fonds des utilisateurs.",
    theme: "trading",
  },
  {
    term: "Cold wallet",
    definition:
      "Wallet dont les clés sont stockées hors ligne (souvent un appareil matériel), plus sûr face aux attaques en ligne.",
    theme: "securite",
  },
  {
    term: "Consensus",
    definition:
      "Mécanisme par lequel les participants d'un réseau se mettent d'accord sur l'état valide de la blockchain.",
    theme: "fondamentaux",
  },
  {
    term: "DeFi",
    definition:
      "« Finance décentralisée » : services financiers (échange, prêt…) fonctionnant via des contrats sur une blockchain, sans intermédiaire central.",
    theme: "defi-nft",
  },
  {
    term: "DEX",
    definition:
      "« Decentralized Exchange » : plateforme d'échange fonctionnant via des smart contracts, où l'utilisateur garde le contrôle de ses fonds.",
    theme: "trading",
  },
  {
    term: "Frais de réseau (gas)",
    definition:
      "Montant payé au réseau pour traiter une transaction, réglé dans la monnaie native de la blockchain.",
    theme: "fondamentaux",
  },
  {
    term: "Hot wallet",
    definition:
      "Wallet connecté à internet, pratique au quotidien mais plus exposé que le cold wallet.",
    theme: "securite",
  },
  {
    term: "Liquidité",
    definition:
      "Facilité avec laquelle un actif peut être acheté ou vendu sans trop faire varier son prix.",
    theme: "trading",
  },
  {
    term: "Mainnet / Testnet",
    definition:
      "Le mainnet est le réseau principal où les actifs ont une valeur réelle ; le testnet sert aux tests, avec des jetons sans valeur.",
    theme: "fondamentaux",
  },
  {
    term: "Market cap",
    definition:
      "Capitalisation : valeur totale d'un actif, estimée en multipliant son prix par le nombre d'unités en circulation.",
    theme: "trading",
  },
  {
    term: "Memecoin",
    definition:
      "Token inspiré d'une blague ou d'un mème internet, souvent très volatil et sans utilité technique particulière.",
    theme: "trading",
  },
  {
    term: "NFT",
    definition:
      "Token unique et non interchangeable, souvent associé à un objet numérique (image, accès, certificat).",
    theme: "defi-nft",
  },
  {
    term: "Proof of Stake",
    definition:
      "Mécanisme de consensus où la validation des transactions repose sur des participants qui immobilisent (« stakent ») des tokens.",
    theme: "fondamentaux",
  },
  {
    term: "Rug pull",
    definition:
      "Arnaque où les créateurs d'un projet retirent soudainement la liquidité ou disparaissent avec les fonds des investisseurs.",
    theme: "securite",
  },
  {
    term: "Seed phrase",
    definition:
      "Phrase de récupération (12 ou 24 mots) permettant de restaurer un wallet. À garder secrète et hors ligne.",
    theme: "securite",
  },
  {
    term: "Slippage",
    definition:
      "Écart entre le prix attendu d'une transaction et le prix réellement obtenu lors de son exécution.",
    theme: "trading",
  },
  {
    term: "Smart contract",
    definition:
      "Programme déployé sur une blockchain qui s'exécute automatiquement selon des règles définies.",
    theme: "fondamentaux",
  },
  {
    term: "Solana",
    definition:
      "Blockchain réputée pour ses transactions rapides et peu coûteuses. Sa monnaie native est le SOL.",
    theme: "fondamentaux",
  },
  {
    term: "Stablecoin",
    definition:
      "Token conçu pour suivre la valeur d'un actif de référence, généralement une monnaie comme le dollar.",
    theme: "defi-nft",
  },
  {
    term: "Staking",
    definition:
      "Action d'immobiliser des tokens pour participer à la sécurité d'un réseau, généralement en échange de récompenses.",
    theme: "defi-nft",
  },
  {
    term: "Token",
    definition:
      "Unité de valeur ou de droit enregistrée sur une blockchain, distincte de la monnaie native du réseau.",
    theme: "fondamentaux",
  },
  {
    term: "Volatilité",
    definition:
      "Ampleur et rapidité des variations de prix d'un actif. Une forte volatilité signifie des variations importantes.",
    theme: "trading",
  },
  {
    term: "Wallet",
    definition:
      "Outil (application ou appareil) qui gère vos clés cryptographiques et vous permet d'interagir avec une blockchain.",
    theme: "securite",
  },
  {
    term: "Whitepaper",
    definition:
      "Document de référence d'un projet crypto, décrivant son fonctionnement, ses objectifs et son aspect technique.",
    theme: "fondamentaux",
  },
];
