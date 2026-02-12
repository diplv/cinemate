/**
 * Calculate field of view angle in degrees.
 * FoV = 2 * atan(sensorDimension / (2 * focalLength))
 */
export function calculateFoV(sensorDimension: number, focalLength: number): number {
  if (focalLength <= 0 || sensorDimension <= 0) return 0;
  return 2 * Math.atan(sensorDimension / (2 * focalLength)) * (180 / Math.PI);
}

/**
 * Calculate sensor diagonal from width and height.
 */
export function sensorDiagonal(width: number, height: number): number {
  return Math.sqrt(width * width + height * height);
}

/**
 * Calculate full-frame (36x24mm) equivalent focal length.
 * FF diagonal = 43.27mm
 */
export function fullFrameEquivalent(
  focalLength: number,
  sensorDiag: number,
): number {
  if (sensorDiag <= 0) return 0;
  const FF_DIAGONAL = 43.27;
  return focalLength * (FF_DIAGONAL / sensorDiag);
}

/**
 * Calculate field dimensions at a given distance.
 * width = 2 * distance * tan(FoV/2)
 */
export function fieldWidth(fovDegrees: number, distance: number): number {
  if (fovDegrees <= 0 || distance <= 0) return 0;
  return 2 * distance * Math.tan((fovDegrees / 2) * (Math.PI / 180));
}

export interface FoVResult {
  horizontalDeg: number;
  verticalDeg: number;
  diagonalDeg: number;
  ffEquivalent: number;
  fieldWidthAtDistance: number | null;
  fieldHeightAtDistance: number | null;
}

/**
 * Full FoV calculation for a given camera sensor and focal length.
 *
 * @param sensorWidth - Sensor width in mm
 * @param sensorHeight - Sensor height in mm
 * @param focalLength - Lens focal length in mm
 * @param anamorphicSqueeze - Anamorphic desqueeze factor (1.0 for spherical)
 * @param distance - Optional subject distance in meters
 */
export function calculateFullFoV(
  sensorWidth: number,
  sensorHeight: number,
  focalLength: number,
  anamorphicSqueeze: number = 1.0,
  distance?: number,
): FoVResult {
  const effectiveWidth = sensorWidth * anamorphicSqueeze;
  const diag = sensorDiagonal(effectiveWidth, sensorHeight);

  const hFoV = calculateFoV(effectiveWidth, focalLength);
  const vFoV = calculateFoV(sensorHeight, focalLength);
  const dFoV = calculateFoV(diag, focalLength);

  const ffEq = fullFrameEquivalent(focalLength, sensorDiagonal(sensorWidth, sensorHeight));

  let fw: number | null = null;
  let fh: number | null = null;
  if (distance && distance > 0) {
    fw = fieldWidth(hFoV, distance);
    fh = fieldWidth(vFoV, distance);
  }

  return {
    horizontalDeg: hFoV,
    verticalDeg: vFoV,
    diagonalDeg: dFoV,
    ffEquivalent: ffEq,
    fieldWidthAtDistance: fw,
    fieldHeightAtDistance: fh,
  };
}
