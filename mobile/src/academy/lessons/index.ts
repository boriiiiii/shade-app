import { Lesson } from "../types";
import { consensusPowVsPos } from "./consensus-pow-vs-pos";
import { gasAndFees } from "./gas-and-fees";
import { layer1Layer2 } from "./layer-1-layer-2";
import { whatIsAToken } from "./what-is-a-token";
import { whatIsBlockchain } from "./what-is-blockchain";
import { whatIsSolana } from "./what-is-solana";
import { commonScams } from "./common-scams";
import { hotVsColdWallet } from "./hot-vs-cold-wallet";
import { privateVsPublicKey } from "./private-vs-public-key";
import { securingYourWallet } from "./securing-your-wallet";
import { selfCustodyBasics } from "./self-custody-basics";
import { tokenApprovals } from "./token-approvals";
import { copyTradingAndSniping } from "./copy-trading-and-sniping";
import { dexVsCex } from "./dex-vs-cex";
import { marketCapAndVolume } from "./market-cap-and-volume";
import { orderBookAndLiquidity } from "./order-book-and-liquidity";
import { orderTypes } from "./order-types";
import { slippageAndPriceImpact } from "./slippage-and-price-impact";
import { ammAndLiquidityPools } from "./amm-and-liquidity-pools";
import { impermanentLoss } from "./impermanent-loss";
import { stablecoins } from "./stablecoins";
import { stakingAndYield } from "./staking-and-yield";
import { understandingNfts } from "./understanding-nfts";
import { whatIsDefi } from "./what-is-defi";
import { compoundInterest } from "./compound-interest";
import { dcaAndTiming } from "./dca-and-timing";
import { diversification } from "./diversification";
import { feesImpact } from "./fees-impact";
import { investingVsSpeculating } from "./investing-vs-speculating";
import { riskAndReturn } from "./risk-and-return";
import { etfVsCrypto } from "./etf-vs-crypto";
import { indexAndBenchmark } from "./index-and-benchmark";
import { spotCryptoEtf } from "./spot-crypto-etf";
import { stocksAndBonds } from "./stocks-and-bonds";
import { whatIsAnEtf } from "./what-is-an-etf";
import { copyTradingRisks } from "./copy-trading-risks";
import { fomoAndFud } from "./fomo-and-fud";
import { positionSizing } from "./position-sizing";
import { survivorshipBias } from "./survivorship-bias";
import { volatility } from "./volatility";
import { cryptoTaxationFrance } from "./crypto-taxation-france";
import { micaAndPsan } from "./mica-and-psan";
import { recordKeeping } from "./record-keeping";

/**
 * Toutes les leçons de l'Academy, dans l'ordre d'affichage (par catégorie,
 * puis par identifiant).
 *
 * Pour ajouter une leçon : créer son fichier dans ce dossier, puis l'ajouter
 * à l'import et au tableau ci-dessous.
 */
export const LESSONS: Lesson[] = [
  consensusPowVsPos,
  gasAndFees,
  layer1Layer2,
  whatIsAToken,
  whatIsBlockchain,
  whatIsSolana,
  commonScams,
  hotVsColdWallet,
  privateVsPublicKey,
  securingYourWallet,
  selfCustodyBasics,
  tokenApprovals,
  copyTradingAndSniping,
  dexVsCex,
  marketCapAndVolume,
  orderBookAndLiquidity,
  orderTypes,
  slippageAndPriceImpact,
  ammAndLiquidityPools,
  impermanentLoss,
  stablecoins,
  stakingAndYield,
  understandingNfts,
  whatIsDefi,
  compoundInterest,
  dcaAndTiming,
  diversification,
  feesImpact,
  investingVsSpeculating,
  riskAndReturn,
  etfVsCrypto,
  indexAndBenchmark,
  spotCryptoEtf,
  stocksAndBonds,
  whatIsAnEtf,
  copyTradingRisks,
  fomoAndFud,
  positionSizing,
  survivorshipBias,
  volatility,
  cryptoTaxationFrance,
  micaAndPsan,
  recordKeeping,
];

/** Retourne une leçon par son identifiant. */
export function getLesson(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}

/** Retourne les leçons d'une catégorie donnée. */
export function getLessonsByCategory(categoryId: string): Lesson[] {
  return LESSONS.filter((l) => l.categoryId === categoryId);
}
