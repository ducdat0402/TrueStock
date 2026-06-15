import type { IndustryComparison } from "@truestock/types";
import { getIndustryByTicker, getPeerTickers } from "../../data/industry-map";
import { fetchFinancialDataFromCafeF } from "../financial/cafef-financial";
import { calculateHealthScore } from "../scoring/health-score.engine";

const PEER_FETCH_TIMEOUT_MS = 10_000;
const MAX_PEERS_TO_FETCH = 6;

interface PeerScore {
  ticker: string;
  score: number;
}

async function fetchPeerScoreWithTimeout(
  ticker: string
): Promise<PeerScore | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), PEER_FETCH_TIMEOUT_MS);

    const data = await fetchFinancialDataFromCafeF(ticker);
    clearTimeout(timeoutId);

    if (!data) return null;

    const { healthScore } = calculateHealthScore(data);
    return { ticker, score: healthScore };
  } catch {
    return null;
  }
}

export async function calculateIndustryComparison(
  ticker: string,
  tickerScore: number
): Promise<IndustryComparison | null> {
  const industry = getIndustryByTicker(ticker);
  if (!industry) return null;

  const peerTickers = getPeerTickers(ticker, MAX_PEERS_TO_FETCH);
  if (peerTickers.length === 0) return null;

  // Fetch peer scores in parallel with timeout
  const peerScorePromises = peerTickers.map((t) => fetchPeerScoreWithTimeout(t));
  const peerResults = await Promise.all(peerScorePromises);

  // Filter out failed fetches
  const validPeerScores = peerResults.filter(
    (r): r is PeerScore => r !== null
  );

  if (validPeerScores.length === 0) return null;

  // Include ticker's own score in the average calculation
  const allScores = [...validPeerScores.map((p) => p.score), tickerScore];
  const industryAvgScore =
    Math.round(
      (allScores.reduce((sum, s) => sum + s, 0) / allScores.length) * 10
    ) / 10;

  const delta = Math.round((tickerScore - industryAvgScore) * 10) / 10;

  // Generate Vietnamese verdict
  let verdict: string;
  if (delta >= 1.5) {
    verdict = `Trung bình ngành ${industry.industryName}: ${industryAvgScore}/10 → ${ticker} đang vượt trội hơn mặt bằng chung (+${delta})`;
  } else if (delta >= 0.5) {
    verdict = `Trung bình ngành ${industry.industryName}: ${industryAvgScore}/10 → ${ticker} đang tốt hơn mặt bằng chung (+${delta})`;
  } else if (delta >= -0.5) {
    verdict = `Trung bình ngành ${industry.industryName}: ${industryAvgScore}/10 → ${ticker} ngang mức trung bình ngành`;
  } else if (delta >= -1.5) {
    verdict = `Trung bình ngành ${industry.industryName}: ${industryAvgScore}/10 → ${ticker} đang thấp hơn mặt bằng chung (${delta})`;
  } else {
    verdict = `Trung bình ngành ${industry.industryName}: ${industryAvgScore}/10 → ${ticker} đang kém hơn đáng kể so với ngành (${delta})`;
  }

  return {
    industryId: industry.industryId,
    industryName: industry.industryName,
    industryAvgScore,
    delta,
    peerCount: validPeerScores.length,
    verdict,
  };
}
