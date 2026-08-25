import { Lesson } from "../types";

/**
 * Leçon : staking et rendement.
 * Contenu purement pédagogique — aucun conseil financier.
 */
export const stakingAndYield: Lesson = {
  id: "staking-and-yield",
  categoryId: "defi-nft",
  title: "Staking et rendement",
  summary:
    "D'où vient un rendement affiché, et quelles contreparties il implique.",
  level: "intermediaire",
  readingMinutes: 5,
  blocks: [
    {
      type: "paragraph",
      text: "Le staking consiste à immobiliser des tokens pour participer à la sécurité d'un réseau en preuve d'enjeu. En contrepartie, le protocole distribue une partie des émissions et des frais de transaction.",
    },
    {
      type: "heading",
      text: "Ce que le rendement rémunère",
    },
    {
      type: "list",
      items: [
        "Un capital immobilisé, indisponible pendant une durée qui peut aller de quelques heures à plusieurs jours.",
        "Un risque de sanction si le validateur choisi se comporte mal ou reste hors ligne.",
        "La volatilité du token lui-même, qui reste entière pendant la période.",
      ],
    },
    {
      type: "callout",
      variant: "key",
      text: "Un rendement de 7 % en SOL reste un rendement en SOL. Si le SOL perd 40 % de sa valeur en euros sur la période, le rendement ne compense pas la variation de prix.",
    },
    {
      type: "heading",
      text: "Staking liquide",
    },
    {
      type: "paragraph",
      text: "Certains services remettent un token représentatif du dépôt, utilisable ailleurs pendant que le capital reste immobilisé. Cette souplesse ajoute une couche : la valeur du token dérivé dépend du bon fonctionnement du service qui l'émet.",
    },
    {
      type: "heading",
      text: "Lire un rendement affiché",
    },
    {
      type: "list",
      items: [
        "APR : le taux annuel sans réinvestissement des gains.",
        "APY : le même taux avec réinvestissement composé — mécaniquement plus élevé.",
        "Les deux sont des projections calculées sur les conditions du moment, pas des engagements.",
      ],
    },
    {
      type: "callout",
      variant: "warning",
      text: "Un rendement nettement supérieur à celui du staking natif du réseau rémunère un risque supplémentaire. Identifier lequel avant de s'engager fait partie de l'analyse.",
    },
  ],
};
