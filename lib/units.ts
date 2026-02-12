export function metersToFeet(meters: number): number {
  return meters * 3.28084;
}

export function feetToMeters(feet: number): number {
  return feet / 3.28084;
}

export function mmToMeters(mm: number): number {
  return mm / 1000;
}

export function formatDistance(meters: number): string {
  if (!isFinite(meters) || meters <= 0) return "---";
  if (meters >= 1000) return "INF";
  const ft = metersToFeet(meters);
  if (meters < 1) {
    return `${(meters * 100).toFixed(1)} cm / ${(ft * 12).toFixed(1)} in`;
  }
  return `${meters.toFixed(2)} m / ${ft.toFixed(1)} ft`;
}

export type UnitSystem = "metric" | "imperial";

export function formatDistanceParts(meters: number): {
  metric: string;
  imperial: string;
} {
  if (!isFinite(meters) || meters <= 0) {
    return { metric: "---", imperial: "---" };
  }
  if (meters >= 1000) {
    return { metric: "INF", imperial: "INF" };
  }
  const ft = metersToFeet(meters);
  if (meters < 1) {
    return {
      metric: `${(meters * 100).toFixed(1)} cm`,
      imperial: `${(ft * 12).toFixed(1)} in`,
    };
  }
  return {
    metric: `${meters.toFixed(2)} m`,
    imperial: `${ft.toFixed(1)} ft`,
  };
}

/**
 * Format a distance value for a single unit system.
 */
export function formatForUnit(meters: number, unit: UnitSystem): string {
  if (!isFinite(meters) || meters <= 0) return "---";
  if (meters >= 1000) return "INF";
  if (unit === "imperial") {
    const ft = metersToFeet(meters);
    if (ft < 1) return `${(ft * 12).toFixed(1)} in`;
    return `${ft.toFixed(1)} ft`;
  }
  if (meters < 1) return `${(meters * 100).toFixed(1)} cm`;
  return `${meters.toFixed(2)} m`;
}
