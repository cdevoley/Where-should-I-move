import type { BLSSeriesResponse } from "@/types/api";
import type { MetricScore } from "@/types/city";
import { formatPercent } from "@/lib/utils";

const BLS_API = "https://api.bls.gov/publicAPI/v2/timeseries/data/";

function makeScore(raw: number, label: string): MetricScore {
  return {
    raw,
    normalized: 0,
    label,
    source: "Bureau of Labor Statistics",
    updatedAt: new Date().toISOString(),
  };
}

export async function fetchBLSSeries(
  seriesIds: string[]
): Promise<BLSSeriesResponse | null> {
  const apiKey = process.env.BLS_API_KEY;
  if (!apiKey) {
    console.warn("BLS_API_KEY not set, skipping BLS data fetch");
    return null;
  }

  const currentYear = new Date().getFullYear();

  const response = await fetch(BLS_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      seriesid: seriesIds,
      startyear: (currentYear - 2).toString(),
      endyear: currentYear.toString(),
      registrationkey: apiKey,
    }),
    next: { revalidate: 86400 * 7 },
  });

  if (!response.ok) {
    console.error(`BLS API error: ${response.status}`);
    return null;
  }

  return response.json();
}

/**
 * Fetch unemployment rate for a county by FIPS code.
 * BLS LAUS series: LAUCN{countyFIPS}0000000003
 */
export async function fetchUnemploymentRate(
  countyFips: string
): Promise<MetricScore | null> {
  const seriesId = `LAUCN${countyFips}0000000003`;
  const data = await fetchBLSSeries([seriesId]);

  if (!data?.Results?.series?.[0]?.data?.[0]) {
    return null;
  }

  const latest = data.Results.series[0].data[0];
  const rate = parseFloat(latest.value);

  return makeScore(rate, formatPercent(rate));
}

/**
 * Extract the most recent value from a BLS series response.
 */
export function getLatestBLSValue(
  response: BLSSeriesResponse,
  seriesId: string
): number | null {
  const series = response.Results?.series?.find((s) => s.seriesID === seriesId);
  if (!series?.data?.[0]) return null;
  return parseFloat(series.data[0].value);
}
