// Open-Meteo Climate API response
export interface OpenMeteoClimateResponse {
  latitude: number;
  longitude: number;
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    sunshine_duration: number[];
  };
}

// US Census ACS API response
export interface CensusACSResponse {
  // Census returns array of arrays, first row is headers
  [index: number]: string[];
}

// BLS API v2 response
export interface BLSSeriesResponse {
  status: string;
  responseTime: number;
  message: string[];
  Results: {
    series: {
      seriesID: string;
      data: {
        year: string;
        period: string;
        periodName: string;
        value: string;
        footnotes: { code: string; text: string }[];
      }[];
    }[];
  };
}

// FBI Crime Data API response
export interface FBICrimeResponse {
  results: {
    ori: string;
    data_year: number;
    actual_murder: number;
    actual_rape_total: number;
    actual_robbery: number;
    actual_assault: number;
    actual_burglary: number;
    actual_larceny: number;
    actual_motor_vehicle_theft: number;
  }[];
}

// Walk Score API response
export interface WalkScoreResponse {
  status: number;
  walkscore: number;
  description: string;
  ws_link: string;
  transit?: {
    score: number;
    description: string;
    summary: string;
  };
  bike?: {
    score: number;
    description: string;
  };
}

// Generic API cache entry
export interface CacheEntry<T = unknown> {
  key: string;
  data: T;
  expiresAt: Date;
  fetchedAt: Date;
}
