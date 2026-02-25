/**
 * Convert a display-referred LUT to a log-to-log CMT for ALF4.
 *
 * Input: LogC3 → Rec.709 (display look)
 * Output: LogC4 → LogC4 (log-to-log CMT)
 *
 * The conversion applies an inverse DRT to the output, so that when
 * the camera applies its standard DRT, the result approximates the
 * original display look.
 */
export declare function convertToLogToLogCmt(inputPath: string, outputPath: string): Promise<void>;
/**
 * Resample a 3D CUBE LUT from LogC3 input space to LogC4 input space.
 *
 * The original LUT maps: LogC3 input -> Rec.709 output (display look).
 * After conversion: LogC4 input -> Rec.709 output.
 *
 * This is equivalent to adding a Color Space Transform (AWG4/LogC4 → AWG3/LogC3)
 * BEFORE the original LUT in DaVinci Resolve.
 *
 * For each grid point in the new LogC4-input LUT:
 * 1. Convert the LogC4 grid value to linear, then to LogC3
 * 2. Look up the original LUT at that LogC3 position (trilinear interpolation)
 * 3. Keep the Rec.709 output values UNCHANGED
 *
 * After this conversion, use ARRI Reference Tool GUI:
 * - Custom Color Management → Skip CDL → Skip CMT → Load as DRT → Save As ALF4
 */
export declare function convertCubeLogC3ToLogC4(inputPath: string, outputPath: string): Promise<void>;
/**
 * Generate an identity CMT CUBE (LogC4 in = LogC4 out, no change).
 * Used as the CMT component in ALF4c files.
 */
export declare function generateIdentityCmtCube(outputPath: string, size?: number): Promise<void>;
/**
 * SCENARIO A SOLUTION: Generate CMT with INVERSE matrix (AWG3→AWG4).
 * Use this if the diagnostic shows CMT is applied but colors are still wrong.
 * The cyan cast might indicate we need the opposite gamut direction.
 */
export declare function generateInverseGamutCmtCube(outputPath: string, size?: number): Promise<void>;
/**
 * Generate a CMT CUBE that converts AWG4 gamut to AWG3 gamut while staying in LogC4 encoding.
 *
 * This CMT is used when the DRT LUT expects AWG3/LogC3 input but the camera
 * outputs AWG4/LogC4. The CMT converts the gamut (AWG4→AWG3) so that when
 * the camera/ART converts LogC4→LogC3 before the DRT, the result is AWG3/LogC3.
 *
 * For each grid point:
 * 1. Decode LogC4 → linear (AWG4 primaries)
 * 2. Apply AWG4 → AWG3 gamut matrix
 * 3. Encode linear → LogC4 (now representing AWG3 values)
 */
export declare function generateGamutConversionCmtCube(outputPath: string, size?: number): Promise<void>;
/**
 * Generate a DIAGNOSTIC CMT that swaps red and blue channels.
 * Used to verify that the CMT is being applied by the camera/ART.
 */
export declare function generateDiagnosticCmtCube(outputPath: string, size?: number): Promise<void>;
/**
 * SCENARIO B SOLUTION: Convert DRT LUT to handle AWG4 gamut in LogC3 space.
 *
 * Use this if CMT is NOT being applied by ART.
 * Assumes ART auto-converts LogC4→LogC3 but NOT gamut.
 *
 * Input: AWG4/LogC3 (what ART outputs after auto-converting transfer only)
 * Output: Rec.709 (display)
 *
 * For each grid point:
 * 1. Decode LogC3 → linear (AWG4 linear)
 * 2. Apply AWG4 → AWG3 gamut matrix
 * 3. Encode linear → LogC3 (now AWG3/LogC3)
 * 4. Look up in original AWG3/LogC3 LUT
 */
export declare function convertCubeAwg4LogC3ToAwg3LogC3(inputPath: string, outputPath: string): Promise<void>;
/**
 * Convert a CUBE LUT from AWG3/LogC3 input space to AWG4/LogC4 input space.
 *
 * The original LUT maps: AWG3/LogC3 input → Rec.709 output (display look).
 * After conversion: AWG4/LogC4 input → Rec.709 output.
 *
 * This bakes in both:
 * 1. Gamut conversion: AWG4 → AWG3 (linear RGB matrix)
 * 2. Transfer function: LogC4 → LogC3
 *
 * For each grid point in the new AWG4/LogC4-input LUT:
 * 1. Decode LogC4 → linear
 * 2. Apply AWG4 → AWG3 gamut matrix
 * 3. Encode linear → LogC3
 * 4. Look up the original LUT at that AWG3/LogC3 position
 * 5. Output the Rec.709 value unchanged
 */
export declare function convertCubeAwg4LogC4ToAwg3LogC3(inputPath: string, outputPath: string): Promise<void>;
//# sourceMappingURL=logc-converter.service.d.ts.map