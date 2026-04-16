import type { WalkScoreResponse } from "@/types/api";
import type { MetricScore } from "@/types/city";

const WALKSCORE_API = "https://api.walkscore.com/score";

function makeScore(raw: number, label: string): MetricScore {
  return {
    raw,
    normalized: raw, // Walk Score is already 0-100
    label,
    source: "Walk Score",
    updatedAt: new Date().toISOString(),
  };
}

export async function fetchWalkScore(
  latitude: number,
  longitude: number,
  address: string
): Promise<WalkScoreResponse | null> {
  const apiKey = process.env.WALKSCORE_API_KEY;
  if (!apiKey) {
    console.warn("WALKSCORE_API_KEY not set, skipping Walk Score fetch");
    return null;
  }

  const params = new URLSearchParams({
    format: "json",
    address,
    lat: latitude.toString(),
    lon: longitude.toString(),
    transit: "1",
    bike: "1",
    wsapikey: apiKey,
  });

  const response = await fetch(`${WALKSCORE_API}?${params}`, {
    next: { revalidate: 86400 * 30 }, // Monthly cache
  });

  if (!response.ok) {
    console.error(`Walk Score API error: ${response.status}`);
    return null;
  }

  const data: WalkScoreResponse = await response.json();

  if (data.status !== 1) {
    console.error(`Walk Score returned status: ${data.status}`);
    return null;
  }

  return data;
}

export function transformWalkScoreData(data: WalkScoreResponse) {
  return {
    walkScore: makeScore(data.walkscore, `${data.walkscore}/100`),
    transitScore: makeScore(
      data.transit?.score ?? 0,
      `${data.transit?.score ?? 0}/100`
    ),
    bikeScore: makeScore(
      data.bike?.score ?? 0,
      `${data.bike?.score ?? 0}/100`
    ),
  };
}
