import type { MetricScore } from "@/types/city";
import { formatCurrency, formatPercent } from "@/lib/utils";

const CENSUS_API = "https://api.census.gov/data/2022/acs/acs5";

function makeScore(raw: number, label: string): MetricScore {
  return {
    raw,
    normalized: 0,
    label,
    source: "US Census ACS 2022",
    updatedAt: new Date().toISOString(),
  };
}

// Census variable codes for the metrics we need
const VARIABLES = {
  medianHomeValue: "B25077_001E",
  medianGrossRent: "B25064_001E",
  medianHouseholdIncome: "B19013_001E",
  totalPopulation: "B01001_001E",
  bachelorDegree: "B15003_022E",
  totalEducation: "B15003_001E",
  highSchoolGrad: "B15003_017E",
  healthInsured: "B27001_001E",
  commuteTime: "B08303_001E",
  publicTransit: "B08301_010E",
  totalCommuters: "B08301_001E",
  homeOwners: "B25003_002E",
  totalHousing: "B25003_001E",
  vacantHousing: "B25002_003E",
  totalHousingUnits: "B25002_001E",
} as const;

export interface CensusData {
  medianHomeValue: number;
  medianGrossRent: number;
  medianHouseholdIncome: number;
  population: number;
  bachelorRate: number;
  highSchoolRate: number;
  insuranceRate: number;
  avgCommuteTime: number;
  publicTransitRate: number;
  homeOwnershipRate: number;
  vacancyRate: number;
}

export async function fetchCensusData(
  stateFips: string,
  placeFips: string
): Promise<CensusData | null> {
  const apiKey = process.env.CENSUS_API_KEY;
  if (!apiKey) {
    console.warn("CENSUS_API_KEY not set, skipping Census data fetch");
    return null;
  }

  const variables = Object.values(VARIABLES).join(",");
  const url = `${CENSUS_API}?get=NAME,${variables}&for=place:${placeFips}&in=state:${stateFips}&key=${apiKey}`;

  const response = await fetch(url, {
    next: { revalidate: 86400 * 7 }, // 7-day cache
  });

  if (!response.ok) {
    console.error(`Census API error: ${response.status}`);
    return null;
  }

  const data: string[][] = await response.json();
  if (data.length < 2) return null;

  const headers = data[0];
  const values = data[1];

  function getVal(varCode: string): number {
    const idx = headers.indexOf(varCode);
    return idx >= 0 ? parseFloat(values[idx]) || 0 : 0;
  }

  const totalEd = getVal(VARIABLES.totalEducation);
  const totalComm = getVal(VARIABLES.totalCommuters);
  const totalHousing = getVal(VARIABLES.totalHousing);
  const totalUnits = getVal(VARIABLES.totalHousingUnits);

  return {
    medianHomeValue: getVal(VARIABLES.medianHomeValue),
    medianGrossRent: getVal(VARIABLES.medianGrossRent),
    medianHouseholdIncome: getVal(VARIABLES.medianHouseholdIncome),
    population: getVal(VARIABLES.totalPopulation),
    bachelorRate: totalEd > 0 ? (getVal(VARIABLES.bachelorDegree) / totalEd) * 100 : 0,
    highSchoolRate: totalEd > 0 ? (getVal(VARIABLES.highSchoolGrad) / totalEd) * 100 : 0,
    insuranceRate: 85, // Placeholder — requires more complex table traversal
    avgCommuteTime: getVal(VARIABLES.commuteTime),
    publicTransitRate: totalComm > 0 ? (getVal(VARIABLES.publicTransit) / totalComm) * 100 : 0,
    homeOwnershipRate: totalHousing > 0 ? (getVal(VARIABLES.homeOwners) / totalHousing) * 100 : 0,
    vacancyRate: totalUnits > 0 ? (getVal(VARIABLES.vacantHousing) / totalUnits) * 100 : 0,
  };
}

export function transformCensusData(data: CensusData) {
  return {
    housing: {
      medianHomeValue: makeScore(data.medianHomeValue, formatCurrency(data.medianHomeValue)),
      homeOwnershipRate: makeScore(data.homeOwnershipRate, formatPercent(data.homeOwnershipRate)),
      vacancyRate: makeScore(data.vacancyRate, formatPercent(data.vacancyRate)),
    },
    costOfLiving: {
      medianRent: makeScore(data.medianGrossRent, `${formatCurrency(data.medianGrossRent)}/mo`),
      medianHomePrice: makeScore(data.medianHomeValue, formatCurrency(data.medianHomeValue)),
    },
    jobMarket: {
      medianHouseholdIncome: makeScore(
        data.medianHouseholdIncome,
        `${formatCurrency(data.medianHouseholdIncome)}/yr`
      ),
    },
    education: {
      bachelorRate: makeScore(data.bachelorRate, formatPercent(data.bachelorRate)),
      highSchoolRate: makeScore(data.highSchoolRate, formatPercent(data.highSchoolRate)),
    },
    healthcare: {
      insuranceRate: makeScore(data.insuranceRate, formatPercent(data.insuranceRate)),
    },
    transit: {
      commuteTime: makeScore(data.avgCommuteTime, `${Math.round(data.avgCommuteTime)} min`),
      publicTransitUsage: makeScore(data.publicTransitRate, formatPercent(data.publicTransitRate)),
    },
  };
}
