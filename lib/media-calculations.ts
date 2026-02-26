export interface MediaCapacityResult {
  totalSeconds: number;
  hours: number;
  minutes: number;
  seconds: number;
  formatted: string;
}

/**
 * Calculate recording time based on card capacity, frame size, and framerate.
 * Formula: (cardGB * usableMultiplier * 1000) / (frameSizeMB * fps) = seconds
 * 
 * Note: Many cards (like ARRI CFast 2.0) don't expose their full capacity.
 * For example, a 512GB CFast 2.0 card typically has ~0.96 usable multiplier.
 */
export function calculateMediaCapacity(
  cardSizeGB: number,
  frameSizeMB: number,
  fps: number,
  usableMultiplier: number = 1.0
): MediaCapacityResult {
  if (frameSizeMB <= 0 || fps <= 0) {
    return {
      totalSeconds: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      formatted: "---",
    };
  }

  // Calculate total seconds using the usable capacity
  const totalUsableMB = cardSizeGB * 1000 * usableMultiplier;
  const totalSeconds = totalUsableMB / (frameSizeMB * fps);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  return {
    totalSeconds,
    hours,
    minutes,
    seconds,
    formatted: formatRecordingTime(totalSeconds),
  };
}

/**
 * Format recording time in human-readable format.
 * Examples: "2h 15m", "45m 30s", "99h+"
 */
export function formatRecordingTime(totalSeconds: number): string {
  if (totalSeconds <= 0) return "---";

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  // Cap at 99h+ for very long times
  if (hours >= 99) {
    return "99h+";
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }

  return `${seconds}s`;
}

/**
 * Calculate data rate adjusted for framerate.
 * Some codecs scale data rate linearly with framerate.
 * baseRate is typically specified at 24fps.
 */
export function adjustDataRateForFramerate(
  baseDataRateMbps: number,
  baseFramerate: number,
  targetFramerate: number
): number {
  return (baseDataRateMbps * targetFramerate) / baseFramerate;
}
