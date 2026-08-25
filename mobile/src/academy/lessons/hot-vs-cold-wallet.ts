import { Lesson } from "../types";

/**
 * Leçon : les types de garde (custodial, hot, cold, multisig).
 * Contenu purement pédagogique — aucun conseil financier.
 */
export const hotVsColdWallet: Lesson = {
  id: "hot-vs-cold-wallet",
  categoryId: "wallets-security",
  title: "Qui détient vraiment vos clés ?",
  summary:
    "Custodial, hot, cold, multisig : quatre façons de garder ses actifs.",
  level: "intermediaire",
  readingMinutes: 5,
  blocks: [
    {
      type: "paragraph",
      text: "Tous les wallets ne se valent pas sur un point précis : qui peut signer une transaction en votre nom. C'est la seule question qui compte vraiment quand on compare des solutions de garde.",
    },
    {
      type: "heading",
      text: "Wallet custodial",
    },
    {
      type: "paragraph",
      text: "Vos clés sont détenues par une plateforme. Vous vous connectez avec un identifiant et un mot de passe, comme sur une banque en ligne. La récupération de compte est possible en cas d'oubli, mais l'accès à vos fonds dépend entièrement de la solvabilité et de la coopération du prestataire.",
    },
    {
      type: "heading",
      text: "Hot wallet non custodial",
    },
    {
      type: "paragraph",
      text: "Les clés sont stockées sur votre appareil, chiffrées par un mot de passe. Phantom, utilisé par Shade, entre dans cette catégorie. Vous signez vous-même chaque transaction, mais les clés restent sur une machine connectée à internet.",
    },
    {
      type: "heading",
      text: "Cold wallet",
    },
    {
      type: "paragraph",
      text: "Les clés vivent dans un appareil dédié qui ne se connecte jamais directement à internet. La transaction est préparée sur l'ordinateur ou le téléphone, puis envoyée à l'appareil pour y être signée. La clé ne sort jamais du boîtier.",
    },
    {
      type: "heading",
      text: "Multisig",
    },
    {
      type: "paragraph",
      text: "Plusieurs clés distinctes sont nécessaires pour valider une transaction — par exemple deux signatures sur trois. Ce fonctionnement est courant pour les trésoreries d'organisations : la compromission d'une seule clé ne suffit plus.",
    },
    {
      type: "callout",
      variant: "key",
      text: "Aucune de ces options n'est « la bonne » dans l'absolu. Chacune déplace le risque : vers un tiers, vers votre appareil, vers un objet physique que vous pouvez perdre, ou vers la coordination entre plusieurs personnes.",
    },
    {
      type: "callout",
      variant: "warning",
      text: "Un wallet matériel ne protège pas d'une signature que vous approuvez vous-même. Si vous validez une transaction malveillante sur l'écran de l'appareil, elle sera exécutée.",
    },
  ],
};
