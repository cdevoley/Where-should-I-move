/**
 * Normalize a raw value to a 0-100 scale using min-max normalization.
 * @param value - The raw metric value
 * @param min - The minimum value in the dataset
 * @param max - The maximum value in the dataset
 * @param invert - If true, lower values get higher scores (for cost, crime, etc.)
 */
export function normalizeScore(
  value: number,
  min: number,
  max: number,
  invert = false
): number {
  if (max === min) return 50;

  const clamped = Math.max(min, Math.min(max, value));
  let normalized = ((clamped - min) / (max - min)) * 100;

  if (invert) {
    normalized = 100 - normalized;
  }

  return Math.round(normalized * 10) / 10;
}

/**
 * Normalize an array of values, returning normalized scores for each.
 * Useful for batch processing all cities for a given metric.
 */
export function normalizeArray(
  values: number[],
  invert = false
): number[] {
  const min = Math.min(...values);
  const max = Math.max(...values);

  return values.map((v) => normalizeScore(v, min, max, invert));
}
