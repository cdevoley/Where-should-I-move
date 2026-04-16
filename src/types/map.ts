import type { MetricCategory } from "./city";

export interface MapViewport {
  latitude: number;
  longitude: number;
  zoom: number;
}

export interface MapMarkerData {
  slug: string;
  name: string;
  state: string;
  latitude: number;
  longitude: number;
  compositeScore: number;
  activeMetricScore?: number;
}

export type MapOverlay = "composite" | MetricCategory;

export interface MapPopupData {
  slug: string;
  name: string;
  state: string;
  compositeScore: number;
  population: number;
  topScores: { category: string; score: number }[];
}
