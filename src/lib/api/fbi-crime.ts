import type { MetricScore } from "@/types/city";

const FBI_API = "https://api.usa.gov/crime/fbi/sapi/api";

function makeScore(raw: number, label: string): MetricScore {
  return {
    raw,
    normalized: 0,
    label,
    source: "FBI Crime Data Explorer",
    updatedAt: new Date().toISOString(),
  };
}

export interface CrimeData {
  violentCrimeRate: number; // per 100k population
  propertyCrimeRate: number; // per 100k population
}

/**
 * Fetch crime data for a state. The FBI API provides state-level estimates.
 * For city-level, we use the state abbreviation and summarize.
 */
export async function fetchStateCrimeData(
  stateAbbr: string
): Promise<CrimeData | null> {
  const apiKey = process.env.FBI_CRIME_API_KEY;
  if (!apiKey) {
    console.warn("FBI_CRIME_API_KEY not set, skipping crime data fetch");
    return null;
  }

  const currentYear = new Date().getFullYear();
  const url = `${FBI_API}/estimates/states/${stateAbbr}/${currentYear - 2}/${currentYear - 1}?api_key=${apiKey}`;

  const response = await fetch(url, {
    next: { revalidate: 86400 * 30 }, // Monthly cache (annual data)
  });

  if (!response.ok) {
    console.error(`FBI Crime API error: ${response.status}`);
    return null;
  }

  const data = await response.json();

  if (!data?.results?.length) return null;

  // Use the most recent year's data
  const latest = data.results[data.results.length - 1];
  const population = latest.population || 1;

  const violentCrime =
    (latest.violent_crime || 0) / population * 100000;
  const propertyCrime =
    (latest.property_crime || 0) / population * 100000;

  return {
    violentCrimeRate: Math.round(violentCrime * 10) / 10,
    propertyCrimeRate: Math.round(propertyCrime * 10) / 10,
  };
}

export function transformCrimeData(data: CrimeData) {
  return {
    violentCrimeRate: makeScore(
      data.violentCrimeRate,
      `${data.violentCrimeRate.toFixed(1)} per 100K`
    ),
    propertyCrimeRate: makeScore(
      data.propertyCrimeRate,
      `${data.propertyCrimeRate.toFixed(1)} per 100K`
    ),
  };
}
