export interface DiopterResult {
  closeFocus: number; // meters
  farFocus: number | null; // meters, null if infinity
  diopterFocalLength: number; // mm
}

/**
 * Focal length of the diopter element itself.
 * f = 1000 / D (mm)
 */
export function diopterFocalLength(diopterStrength: number): number {
  if (diopterStrength === 0) return Infinity;
  return 1000 / diopterStrength;
}

/**
 * Calculate effective close and far focus when a close-up diopter
 * is attached to a lens.
 *
 * @param diopterStrength - Diopter power (e.g. +0.5, +1, +2, +3)
 * @param focusDistance - Lens focus distance in meters (Infinity for infinity)
 * @param lensPhysicalLength - Optional: distance from sensor plane to front
 *   element in mm. Shifts the working distance closer.
 */
export function calculateDiopter(
  diopterStrength: number,
  focusDistance: number,
  lensPhysicalLength: number = 0,
): DiopterResult {
  if (diopterStrength <= 0) {
    return {
      closeFocus: focusDistance,
      farFocus: null,
      diopterFocalLength: diopterStrength === 0 ? Infinity : 1000 / diopterStrength,
    };
  }

  const D = diopterStrength;
  const dFocal = 1000 / D; // diopter focal length in mm

  // Close focus: lens focused at its minimum / given distance
  // Combined: 1 / (D + 1/d)  where d is in meters
  let closeFocus: number;
  if (!isFinite(focusDistance)) {
    // Lens at infinity: close focus = diopter focal length
    closeFocus = dFocal / 1000; // convert mm to meters
  } else {
    closeFocus = 1 / (D + 1 / focusDistance);
  }

  // Far focus: lens focused at infinity through diopter
  // = 1 / D = diopter focal length in meters
  const farFocus = dFocal / 1000;

  // Compensate for lens physical length
  const lengthCompensation = lensPhysicalLength / 1000; // mm to meters

  const adjustedClose = Math.max(0.001, closeFocus - lengthCompensation);
  const adjustedFar = Math.max(adjustedClose, farFocus - lengthCompensation);

  return {
    closeFocus: adjustedClose,
    farFocus: adjustedFar >= 999 ? null : adjustedFar,
    diopterFocalLength: dFocal,
  };
}

/**
 * Calculate the effective focus range (near/far DOF limits) when a diopter
 * is combined with a lens.
 * Uses thin-lens depth of field approximation.
 *
 * @param focalLength - Lens focal length in mm
 * @param aperture - T-stop / f-stop number
 * @param subjectDistance - Distance to subject in meters
 * @param coc - Circle of confusion in mm (default 0.03 for S35)
 */
export function calculateDOF(
  focalLength: number,
  aperture: number,
  subjectDistance: number,
  coc: number = 0.03,
): { near: number; far: number | null; total: number | null } {
  if (subjectDistance <= 0 || !isFinite(subjectDistance)) {
    return { near: 0, far: null, total: null };
  }

  const f = focalLength; // mm
  const N = aperture;
  const s = subjectDistance * 1000; // convert to mm

  // Hyperfocal distance in mm
  const H = (f * f) / (N * coc) + f;

  // Near limit
  const near = (s * (H - f)) / (H + s - 2 * f);

  // Far limit
  const farDenom = H - s;
  const far = farDenom <= 0 ? null : (s * (H - f)) / farDenom;

  const nearM = near / 1000;
  const farM = far !== null ? far / 1000 : null;
  const total = farM !== null ? farM - nearM : null;

  return {
    near: Math.max(0, nearM),
    far: farM,
    total,
  };
}
