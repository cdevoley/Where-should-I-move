const MAPBOX_GEOCODING_API = "https://api.mapbox.com/geocoding/v5/mapbox.places";

export interface GeocodingResult {
  placeName: string;
  latitude: number;
  longitude: number;
}

export async function geocodeCity(
  cityName: string,
  state: string
): Promise<GeocodingResult | null> {
  const token = process.env.MAPBOX_ACCESS_TOKEN;
  if (!token) {
    console.warn("MAPBOX_ACCESS_TOKEN not set, skipping geocoding");
    return null;
  }

  const query = encodeURIComponent(`${cityName}, ${state}, United States`);
  const url = `${MAPBOX_GEOCODING_API}/${query}.json?access_token=${token}&types=place&country=US&limit=1`;

  const response = await fetch(url, {
    next: { revalidate: 86400 * 30 },
  });

  if (!response.ok) {
    console.error(`Mapbox Geocoding error: ${response.status}`);
    return null;
  }

  const data = await response.json();

  if (!data.features?.length) return null;

  const feature = data.features[0];
  return {
    placeName: feature.place_name,
    latitude: feature.center[1],
    longitude: feature.center[0],
  };
}
