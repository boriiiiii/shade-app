import { Lesson } from "../types";
import { whatIsBlockchain } from "./what-is-blockchain";
import { whatIsAToken } from "./what-is-a-token";
import { privateVsPublicKey } from "./private-vs-public-key";
import { securingYourWallet } from "./securing-your-wallet";
import { copyTradingAndSniping } from "./copy-trading-and-sniping";
import { dexVsCex } from "./dex-vs-cex";
import { whatIsDefi } from "./what-is-defi";
import { understandingNfts } from "./understanding-nfts";

/**
 * Toutes les leçons de l'app, dans l'ordre d'affichage.
 * Pour ajouter une leçon : créer son fichier puis l'ajouter ici.
 */
export const LESSONS: Lesson[] = [
  whatIsBlockchain,
  whatIsAToken,
  privateVsPublicKey,
  securingYourWallet,
  copyTradingAndSniping,
  dexVsCex,
  whatIsDefi,
  understandingNfts,
];

/** Retourne une leçon par son identifiant. */
export function getLesson(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}

/** Retourne les leçons d'une catégorie donnée. */
export function getLessonsByCategory(categoryId: string): Lesson[] {
  return LESSONS.filter((l) => l.categoryId === categoryId);
}
