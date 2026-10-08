// ============================================================
// QIBLA CALCULATOR — Pure math, zero React dependencies
// Uses the Great-Circle (orthodromic) bearing formula on WGS-84
// ============================================================

/** Kaaba coordinates — Al-Masjid al-Haram, Makkah al-Mukarramah */
export const KAABA = { lat: 21.422487, lon: 39.826206 };

const toRad = (deg) => (deg * Math.PI) / 180;
const toDeg = (rad) => (rad * 180) / Math.PI;
const R_EARTH = 6371.0088; // mean Earth radius in km (WGS-84)

/**
 * Calculate the Qibla bearing from a user location using the
 * initial-bearing great-circle formula.
 *
 * @param {number} userLat — user latitude in degrees
 * @param {number} userLon — user longitude in degrees
 * @returns {number} bearing in degrees [0, 360)
 */
export function calculateQiblaBearing(userLat, userLon) {
  const φ1 = toRad(userLat);
  const φ2 = toRad(KAABA.lat);
  const Δλ = toRad(KAABA.lon - userLon);

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

  const θ = Math.atan2(y, x);
  return (toDeg(θ) + 360) % 360;
}

/**
 * Calculate the shortest turn direction from current heading to target.
 * Handles 0°/360° wrap-around correctly.
 *
 * @param {number} heading   — current device heading [0, 360)
 * @param {number} bearing   — target Qibla bearing [0, 360)
 * @returns {{ direction: 'left'|'right'|'aligned', degrees: number }}
 */
export function calculateTurnDirection(heading, bearing) {
  let diff = ((bearing - heading + 540) % 360) - 180; // normalize to [-180, 180]
  const absDiff = Math.abs(diff);

  if (absDiff <= 3) return { direction: 'aligned', degrees: 0 };

  return {
    direction: diff < 0 ? 'left' : 'right',
    degrees: absDiff,
  };
}

/**
 * Calculate the great-circle distance to the Kaaba using the Haversine formula.
 *
 * @param {number} userLat
 * @param {number} userLon
 * @returns {number} distance in kilometres
 */
export function calculateDistanceToKaaba(userLat, userLon) {
  const φ1 = toRad(userLat);
  const φ2 = toRad(KAABA.lat);
  const Δφ = toRad(KAABA.lat - userLat);
  const Δλ = toRad(KAABA.lon - userLon);

  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R_EARTH * c;
}

/**
 * Apply a circular IIR exponential smoothing filter.
 * Handles the 0°/360° wrap-around boundary correctly.
 *
 * @param {number|null} prev   — previous smoothed value (null on first call)
 * @param {number}      raw    — new raw sensor reading [0, 360)
 * @param {number}      alpha  — smoothing factor, default 0.15
 * @returns {number} smoothed value [0, 360)
 */
export function smoothHeading(prev, raw, alpha = 0.15) {
  if (prev === null || prev === undefined) return raw;
  const Δ = ((raw - prev + 540) % 360) - 180; // shortest delta
  return (prev + alpha * Δ + 360) % 360;
}
