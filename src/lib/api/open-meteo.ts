import type { OpenMeteoClimateResponse } from "@/types/api";
import type { WeatherMetrics, MetricScore } from "@/types/city";

const CLIMATE_API = "https://climate-api.open-meteo.com/v1/climate";

function makeScore(raw: number, label: string): MetricScore {
  return {
    raw,
    normalized: 0, // Normalized later across all cities
    label,
    source: "Open-Meteo",
    updatedAt: new Date().toISOString(),
  };
}

export async function fetchClimateData(
  latitude: number,
  longitude: number
): Promise<OpenMeteoClimateResponse> {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    start_date: "1991-01-01",
    end_date: "2020-12-31",
    models: "EC_Earth3P_HR",
    daily: "temperature_2m_max,temperature_2m_min,precipitation_sum,sunshine_duration",
  });

  const response = await fetch(`${CLIMATE_API}?${params}`, {
    next: { revalidate: 86400 * 30 }, // 30-day cache (climate normals don't change)
  });

  if (!response.ok) {
    throw new Error(`Open-Meteo API error: ${response.status}`);
  }

  return response.json();
}

export function transformClimateData(
  data: OpenMeteoClimateResponse
): Omit<WeatherMetrics, "overall"> {
  const { daily } = data;

  // Calculate monthly averages for summer (Jun-Aug) highs
  const summerMonths = [5, 6, 7]; // 0-indexed
  const winterMonths = [11, 0, 1];

  let summerHighSum = 0;
  let summerHighCount = 0;
  let winterLowSum = 0;
  let winterLowCount = 0;
  let totalRainfall = 0;
  let totalSunshine = 0;
  let comfortDays = 0;

  for (let i = 0; i < daily.time.length; i++) {
    const month = new Date(daily.time[i]).getMonth();
    const high = daily.temperature_2m_max[i];
    const low = daily.temperature_2m_min[i];

    if (summerMonths.includes(month)) {
      summerHighSum += high;
      summerHighCount++;
    }
    if (winterMonths.includes(month)) {
      winterLowSum += low;
      winterLowCount++;
    }

    totalRainfall += daily.precipitation_sum[i] || 0;
    totalSunshine += daily.sunshine_duration[i] || 0;

    // Comfort: days where high is 15-30C (59-86F) and low > 5C (41F)
    if (high >= 15 && high <= 30 && low > 5) {
      comfortDays++;
    }
  }

  const years = 30;
  const avgHighSummer = summerHighCount > 0 ? summerHighSum / summerHighCount : 0;
  const avgLowWinter = winterLowCount > 0 ? winterLowSum / winterLowCount : 0;
  const annualRainfall = totalRainfall / years;
  const sunnyDaysPerYear = (totalSunshine / years / 86400) * 365; // rough: sunshine_duration is seconds
  const comfortDaysPerYear = comfortDays / years;

  // Convert C to F for display
  const toF = (c: number) => Math.round(c * 9 / 5 + 32);

  return {
    avgHighSummer: makeScore(avgHighSummer, `${toF(avgHighSummer)}°F`),
    avgLowWinter: makeScore(avgLowWinter, `${toF(avgLowWinter)}°F`),
    annualRainfall: makeScore(annualRainfall, `${Math.round(annualRainfall / 25.4)}" rain/yr`),
    sunnyDays: makeScore(sunnyDaysPerYear, `${Math.round(sunnyDaysPerYear)} days/yr`),
    comfortIndex: makeScore(comfortDaysPerYear, `${Math.round(comfortDaysPerYear)} comfort days/yr`),
  };
}
