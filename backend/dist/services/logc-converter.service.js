import { readFile, writeFile } from "node:fs/promises";
// ARRI LogC3 transfer function coefficients (EI 800)
// Reference: ARRI LogC3 specification
const LOGC3 = {
    cut: 0.010591,
    a: 5.555556,
    b: 0.052272,
    c: 0.247190,
    d: 0.385537,
    e: 5.367655,
    f: 0.092809,
};
// ARRI LogC4 transfer function constants
// Reference: ARRI LogC4 specification / colour-science
const LOGC4 = {
    a: 2231.8263090676883,
    b: 0.9071358748778103, // (1023 - 95) / 1023
    c: 0.09286412512218964, // 95 / 1023
    s: 0.1135972086105891,
    t: -0.01805699611991131,
};
/**
 * AWG4 to AWG3 gamut conversion matrix.
 * Converts linear RGB from ARRI Wide Gamut 4 to ARRI Wide Gamut 3.
 *
 * Computed from official ARRI primaries:
 * AWG4: R(0.7347, 0.2653), G(0.1424, 0.8576), B(0.0991, -0.0308), W=D65
 * AWG3: R(0.6840, 0.3130), G(0.2210, 0.8480), B(0.0861, -0.1020), W=D65
 *
 * Matrix = XYZ_to_AWG3 * AWG4_to_XYZ
 */
const AWG4_TO_AWG3_MATRIX = [
    [1.138221, -0.144940, 0.006719],
    [-0.095585, 1.008229, 0.087357],
    [-0.008318, 0.058954, 0.949363],
];
/** Apply 3x3 matrix to RGB triplet */
function applyMatrix(matrix, r, g, b) {
    return [
        matrix[0][0] * r + matrix[0][1] * g + matrix[0][2] * b,
        matrix[1][0] * r + matrix[1][1] * g + matrix[1][2] * b,
        matrix[2][0] * r + matrix[2][1] * g + matrix[2][2] * b,
    ];
}
/** Convert LogC4 encoded value (0-1) to linear scene light */
function logC4ToLinear(x) {
    if (x >= 0.0) {
        // Log section (covers all valid output range since sensor black is at x = 0.0928)
        return (Math.pow(2.0, 14.0 * (x - LOGC4.c) / LOGC4.b + 6.0) - 64.0) / LOGC4.a;
    }
    // Linear section (for values below 0)
    return x * LOGC4.s + LOGC4.t;
}
/** Convert linear scene light to LogC4 encoded value (0-1) */
function linearToLogC4(x) {
    if (x >= LOGC4.t) {
        // Log section
        return (Math.log2(LOGC4.a * x + 64.0) - 6.0) / 14.0 * LOGC4.b + LOGC4.c;
    }
    // Linear section (for very dark values)
    return (x - LOGC4.t) / LOGC4.s;
}
/**
 * Convert Rec.709/BT.1886 display value to linear light.
 * BT.1886 uses gamma 2.4 for the main curve.
 */
function rec709ToLinear(x) {
    // BT.1886 EOTF inverse (simplified)
    // For values near black, use linear segment
    if (x < 0.081) {
        return x / 4.5;
    }
    return Math.pow((x + 0.099) / 1.099, 1.0 / 0.45);
}
/**
 * Inverse of ARRI's standard DRT (Display Rendering Transform).
 * Converts Rec.709 display values back to LogC4 scene-referred values.
 *
 * This approximates the inverse of the camera's built-in LogC4→Rec.709 transform.
 * When the camera applies its DRT to our CMT output, it should reproduce
 * approximately the original display look.
 *
 * Inverse chain:
 * 1. Rec.709 display → linear display (inverse gamma ~2.4)
 * 2. Linear display → linear scene (inverse tone map, approximate)
 * 3. Linear scene → LogC4 code value
 */
function inverseDrtToLogC4(displayValue) {
    // Clamp to valid range
    const v = Math.max(0, Math.min(1, displayValue));
    // Step 1: Inverse display gamma (BT.1886 approximation)
    // BT.1886 uses gamma 2.4 with black lift compensation
    const linearDisplay = Math.pow(v, 2.4);
    // Step 2: Inverse tone mapping (approximate)
    // ARRI's DRT includes highlight rolloff and contrast adjustment
    // This is a simplified inverse that maps:
    // - display 0 → scene ~0 (black)
    // - display 0.18^(1/2.4) ≈ 0.46 → scene 0.18 (middle gray)
    // - display 1.0 → scene ~1.0 (white)
    // We use a simple power curve to approximate the inverse
    const linearScene = linearDisplay;
    // Step 3: Encode to LogC4
    return linearToLogC4(Math.max(0, linearScene));
}
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
export async function convertToLogToLogCmt(inputPath, outputPath) {
    const content = await readFile(inputPath, "utf-8");
    const lines = content.split("\n");
    // Parse the CUBE file
    let lutSize = 0;
    const headerLines = [];
    const dataValues = [];
    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed === "" || trimmed.startsWith("#") || trimmed.startsWith("TITLE")) {
            headerLines.push(line);
            continue;
        }
        const sizeMatch = trimmed.match(/^LUT_3D_SIZE\s+(\d+)/);
        if (sizeMatch) {
            lutSize = parseInt(sizeMatch[1], 10);
            headerLines.push(line);
            continue;
        }
        if (trimmed.startsWith("DOMAIN_MIN") || trimmed.startsWith("DOMAIN_MAX")) {
            headerLines.push(line);
            continue;
        }
        const parts = trimmed.split(/\s+/);
        if (parts.length === 3) {
            const [r, g, b] = parts.map(Number);
            if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
                dataValues.push([r, g, b]);
                continue;
            }
        }
        headerLines.push(line);
    }
    if (lutSize === 0) {
        throw new Error("Could not find LUT_3D_SIZE in CUBE file");
    }
    const expectedEntries = lutSize * lutSize * lutSize;
    if (dataValues.length !== expectedEntries) {
        throw new Error(`CUBE file has ${dataValues.length} entries but LUT_3D_SIZE ${lutSize} expects ${expectedEntries}`);
    }
    // Build 3D array (CUBE format: R changes fastest, B slowest)
    const lutData = [];
    for (let r = 0; r < lutSize; r++) {
        lutData[r] = [];
        for (let g = 0; g < lutSize; g++) {
            lutData[r][g] = [];
        }
    }
    for (let i = 0; i < dataValues.length; i++) {
        const r = i % lutSize;
        const g = Math.floor(i / lutSize) % lutSize;
        const b = Math.floor(i / (lutSize * lutSize));
        lutData[r][g][b] = dataValues[i];
    }
    // Resample with inverse DRT on output (write R-fastest order)
    const newData = [];
    for (let bi = 0; bi < lutSize; bi++) {
        for (let gi = 0; gi < lutSize; gi++) {
            for (let ri = 0; ri < lutSize; ri++) {
                // Grid position in LogC4 input space
                const rLogC4 = ri / (lutSize - 1);
                const gLogC4 = gi / (lutSize - 1);
                const bLogC4 = bi / (lutSize - 1);
                // Convert to LogC3 for lookup
                const rLogC3 = logC4ToLogC3(rLogC4);
                const gLogC3 = logC4ToLogC3(gLogC4);
                const bLogC3 = logC4ToLogC3(bLogC4);
                // Look up original LUT (returns Rec.709 display values)
                const [dispR, dispG, dispB] = trilinearInterpolate(lutData, lutSize, rLogC3, gLogC3, bLogC3);
                // Apply inverse DRT to get LogC4 output
                const outR = inverseDrtToLogC4(dispR);
                const outG = inverseDrtToLogC4(dispG);
                const outB = inverseDrtToLogC4(dispB);
                newData.push(`${outR.toFixed(10)} ${outG.toFixed(10)} ${outB.toFixed(10)}`);
            }
        }
    }
    // Update header for log-to-log CMT
    const updatedHeader = headerLines.map((line) => {
        if (line.includes("Source color space")) {
            return "# Source color space AWG4/D65/LogC4";
        }
        if (line.includes("Target color space")) {
            return "# Target color space AWG4/D65/LogC4";
        }
        return line;
    });
    const output = [...updatedHeader, ...newData, ""].join("\n");
    await writeFile(outputPath, output, "utf-8");
}
function linearToLogC3(x) {
    if (x > LOGC3.cut) {
        return LOGC3.c * Math.log10(LOGC3.a * x + LOGC3.b) + LOGC3.d;
    }
    return LOGC3.e * x + LOGC3.f;
}
/** Convert a single channel from LogC4 space to LogC3 space */
function logC4ToLogC3(logC4Value) {
    const linear = logC4ToLinear(logC4Value);
    const logC3 = linearToLogC3(linear);
    // Clamp to valid LogC3 range (0-1) to avoid lookup issues
    // LogC4 has extended shadow range that LogC3 doesn't cover
    return Math.max(0, Math.min(1, logC3));
}
/** Clamp value to 0-1 range */
function clamp01(x) {
    return Math.max(0, Math.min(1, x));
}
/**
 * Trilinear interpolation in a 3D LUT.
 * lutData[r][g][b] = [R, G, B] output triplet.
 * Coordinates r, g, b are in 0..1 range.
 */
function trilinearInterpolate(lutData, size, r, g, b) {
    // Scale to LUT grid coordinates
    const rScaled = clamp01(r) * (size - 1);
    const gScaled = clamp01(g) * (size - 1);
    const bScaled = clamp01(b) * (size - 1);
    // Integer indices
    const r0 = Math.min(Math.floor(rScaled), size - 2);
    const g0 = Math.min(Math.floor(gScaled), size - 2);
    const b0 = Math.min(Math.floor(bScaled), size - 2);
    const r1 = r0 + 1;
    const g1 = g0 + 1;
    const b1 = b0 + 1;
    // Fractional parts
    const fr = rScaled - r0;
    const fg = gScaled - g0;
    const fb = bScaled - b0;
    // 8 corner values
    const c000 = lutData[r0][g0][b0];
    const c001 = lutData[r0][g0][b1];
    const c010 = lutData[r0][g1][b0];
    const c011 = lutData[r0][g1][b1];
    const c100 = lutData[r1][g0][b0];
    const c101 = lutData[r1][g0][b1];
    const c110 = lutData[r1][g1][b0];
    const c111 = lutData[r1][g1][b1];
    const result = [0, 0, 0];
    for (let ch = 0; ch < 3; ch++) {
        // Interpolate along B axis
        const c00 = c000[ch] * (1 - fb) + c001[ch] * fb;
        const c01 = c010[ch] * (1 - fb) + c011[ch] * fb;
        const c10 = c100[ch] * (1 - fb) + c101[ch] * fb;
        const c11 = c110[ch] * (1 - fb) + c111[ch] * fb;
        // Interpolate along G axis
        const c0 = c00 * (1 - fg) + c01 * fg;
        const c1 = c10 * (1 - fg) + c11 * fg;
        // Interpolate along R axis
        result[ch] = c0 * (1 - fr) + c1 * fr;
    }
    return result;
}
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
export async function convertCubeLogC3ToLogC4(inputPath, outputPath) {
    const content = await readFile(inputPath, "utf-8");
    const lines = content.split("\n");
    // Parse the CUBE file
    let lutSize = 0;
    const headerLines = [];
    const dataValues = [];
    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed === "" || trimmed.startsWith("#") || trimmed.startsWith("TITLE")) {
            headerLines.push(line);
            continue;
        }
        const sizeMatch = trimmed.match(/^LUT_3D_SIZE\s+(\d+)/);
        if (sizeMatch) {
            lutSize = parseInt(sizeMatch[1], 10);
            headerLines.push(line);
            continue;
        }
        if (trimmed.startsWith("DOMAIN_MIN") || trimmed.startsWith("DOMAIN_MAX")) {
            headerLines.push(line);
            continue;
        }
        // Parse RGB triplet
        const parts = trimmed.split(/\s+/);
        if (parts.length === 3) {
            const [r, g, b] = parts.map(Number);
            if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
                dataValues.push([r, g, b]);
                continue;
            }
        }
        // Unknown line, preserve
        headerLines.push(line);
    }
    if (lutSize === 0) {
        throw new Error("Could not find LUT_3D_SIZE in CUBE file");
    }
    const expectedEntries = lutSize * lutSize * lutSize;
    if (dataValues.length !== expectedEntries) {
        throw new Error(`CUBE file has ${dataValues.length} entries but LUT_3D_SIZE ${lutSize} expects ${expectedEntries}`);
    }
    // Build 3D array from flat data (CUBE format: R changes fastest, B slowest)
    const lutData = [];
    for (let r = 0; r < lutSize; r++) {
        lutData[r] = [];
        for (let g = 0; g < lutSize; g++) {
            lutData[r][g] = [];
        }
    }
    for (let i = 0; i < dataValues.length; i++) {
        const r = i % lutSize;
        const g = Math.floor(i / lutSize) % lutSize;
        const b = Math.floor(i / (lutSize * lutSize));
        lutData[r][g][b] = dataValues[i];
    }
    // Resample: for each grid point in LogC4 space, find the corresponding
    // LogC3 coordinate and interpolate in the original LUT
    // Write in R-fastest order (CUBE convention)
    const newData = [];
    for (let bi = 0; bi < lutSize; bi++) {
        for (let gi = 0; gi < lutSize; gi++) {
            for (let ri = 0; ri < lutSize; ri++) {
                // Grid position in 0-1 (LogC4 input space)
                const rLogC4 = ri / (lutSize - 1);
                const gLogC4 = gi / (lutSize - 1);
                const bLogC4 = bi / (lutSize - 1);
                // Convert LogC4 grid values to LogC3 coordinates
                const rLogC3 = logC4ToLogC3(rLogC4);
                const gLogC3 = logC4ToLogC3(gLogC4);
                const bLogC3 = logC4ToLogC3(bLogC4);
                // Look up in original LogC3 LUT with trilinear interpolation
                // Keep Rec.709 output values UNCHANGED
                const [outR, outG, outB] = trilinearInterpolate(lutData, lutSize, rLogC3, gLogC3, bLogC3);
                newData.push(`${outR.toFixed(10)} ${outG.toFixed(10)} ${outB.toFixed(10)}`);
            }
        }
    }
    // Update header: Source is now LogC4, Target stays as Rec.709
    const updatedHeader = headerLines.map((line) => {
        if (line.includes("Source color space") && line.includes("LogC3")) {
            return line.replace("LogC3", "LogC4").replace("AWG3", "AWG4");
        }
        // Keep target as Rec.709 - this is a display-referred LUT
        return line;
    });
    // Write output CUBE
    const output = [...updatedHeader, ...newData, ""].join("\n");
    await writeFile(outputPath, output, "utf-8");
}
/**
 * Generate an identity CMT CUBE (LogC4 in = LogC4 out, no change).
 * Used as the CMT component in ALF4c files.
 */
export async function generateIdentityCmtCube(outputPath, size = 17) {
    const header = [
        "# Identity CMT for ALF4c",
        "# Source color space AWG4/D65/LogC4",
        "# Target color space AWG4/D65/LogC4",
        "",
        "DOMAIN_MIN 0 0 0",
        "DOMAIN_MAX 1 1 1",
        "",
        `LUT_3D_SIZE ${size}`,
        "",
    ];
    const data = [];
    for (let bi = 0; bi < size; bi++) {
        for (let gi = 0; gi < size; gi++) {
            for (let ri = 0; ri < size; ri++) {
                const r = ri / (size - 1);
                const g = gi / (size - 1);
                const b = bi / (size - 1);
                data.push(`${r.toFixed(10)} ${g.toFixed(10)} ${b.toFixed(10)}`);
            }
        }
    }
    const output = [...header, ...data, ""].join("\n");
    await writeFile(outputPath, output, "utf-8");
}
/**
 * AWG3 to AWG4 gamut conversion matrix (inverse of AWG4_TO_AWG3).
 * Use this if the color shift suggests we need the opposite direction.
 */
const AWG3_TO_AWG4_MATRIX = [
    [0.889256, 0.128898, -0.018154],
    [0.084083, 1.009391, -0.093476],
    [0.002570, -0.061552, 1.058984],
];
/**
 * SCENARIO A SOLUTION: Generate CMT with INVERSE matrix (AWG3→AWG4).
 * Use this if the diagnostic shows CMT is applied but colors are still wrong.
 * The cyan cast might indicate we need the opposite gamut direction.
 */
export async function generateInverseGamutCmtCube(outputPath, size = 33) {
    const header = [
        "# AWG3 to AWG4 Gamut Conversion CMT (INVERSE)",
        "# Source color space AWG4/D65/LogC4",
        "# Target color space AWG4/D65/LogC4",
        "",
        "DOMAIN_MIN 0 0 0",
        "DOMAIN_MAX 1 1 1",
        "",
        `LUT_3D_SIZE ${size}`,
        "",
    ];
    const data = [];
    for (let bi = 0; bi < size; bi++) {
        for (let gi = 0; gi < size; gi++) {
            for (let ri = 0; ri < size; ri++) {
                const rLogC4 = ri / (size - 1);
                const gLogC4 = gi / (size - 1);
                const bLogC4 = bi / (size - 1);
                // Decode LogC4 → linear
                const rLinear = logC4ToLinear(rLogC4);
                const gLinear = logC4ToLinear(gLogC4);
                const bLinear = logC4ToLinear(bLogC4);
                // Apply INVERSE matrix: AWG3 → AWG4
                const [rOut, gOut, bOut] = applyMatrix(AWG3_TO_AWG4_MATRIX, rLinear, gLinear, bLinear);
                // Encode back to LogC4
                const outR = linearToLogC4(rOut);
                const outG = linearToLogC4(gOut);
                const outB = linearToLogC4(bOut);
                data.push(`${outR.toFixed(10)} ${outG.toFixed(10)} ${outB.toFixed(10)}`);
            }
        }
    }
    const output = [...header, ...data, ""].join("\n");
    await writeFile(outputPath, output, "utf-8");
}
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
export async function generateGamutConversionCmtCube(outputPath, size = 33) {
    const header = [
        "# AWG4 to AWG3 Gamut Conversion CMT",
        "# Source color space AWG4/D65/LogC4",
        "# Target color space AWG4/D65/LogC4",
        "",
        "DOMAIN_MIN 0 0 0",
        "DOMAIN_MAX 1 1 1",
        "",
        `LUT_3D_SIZE ${size}`,
        "",
    ];
    const data = [];
    for (let bi = 0; bi < size; bi++) {
        for (let gi = 0; gi < size; gi++) {
            for (let ri = 0; ri < size; ri++) {
                // Grid position in LogC4 space (AWG4)
                const rLogC4 = ri / (size - 1);
                const gLogC4 = gi / (size - 1);
                const bLogC4 = bi / (size - 1);
                // Step 1: Decode LogC4 → linear (AWG4)
                const rLinear = logC4ToLinear(rLogC4);
                const gLinear = logC4ToLinear(gLogC4);
                const bLinear = logC4ToLinear(bLogC4);
                // Step 2: Apply AWG4 → AWG3 gamut matrix
                const [rAwg3, gAwg3, bAwg3] = applyMatrix(AWG4_TO_AWG3_MATRIX, rLinear, gLinear, bLinear);
                // Step 3: Encode linear → LogC4 (now representing AWG3 values)
                const outR = linearToLogC4(rAwg3);
                const outG = linearToLogC4(gAwg3);
                const outB = linearToLogC4(bAwg3);
                data.push(`${outR.toFixed(10)} ${outG.toFixed(10)} ${outB.toFixed(10)}`);
            }
        }
    }
    const output = [...header, ...data, ""].join("\n");
    await writeFile(outputPath, output, "utf-8");
}
/**
 * Generate a DIAGNOSTIC CMT that swaps red and blue channels.
 * Used to verify that the CMT is being applied by the camera/ART.
 */
export async function generateDiagnosticCmtCube(outputPath, size = 17) {
    const header = [
        "# DIAGNOSTIC CMT - Swaps Red and Blue",
        "# Source color space AWG4/D65/LogC4",
        "# Target color space AWG4/D65/LogC4",
        "",
        "DOMAIN_MIN 0 0 0",
        "DOMAIN_MAX 1 1 1",
        "",
        `LUT_3D_SIZE ${size}`,
        "",
    ];
    const data = [];
    for (let bi = 0; bi < size; bi++) {
        for (let gi = 0; gi < size; gi++) {
            for (let ri = 0; ri < size; ri++) {
                const r = ri / (size - 1);
                const g = gi / (size - 1);
                const b = bi / (size - 1);
                // Swap R and B channels
                data.push(`${b.toFixed(10)} ${g.toFixed(10)} ${r.toFixed(10)}`);
            }
        }
    }
    const output = [...header, ...data, ""].join("\n");
    await writeFile(outputPath, output, "utf-8");
}
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
export async function convertCubeAwg4LogC3ToAwg3LogC3(inputPath, outputPath) {
    const content = await readFile(inputPath, "utf-8");
    const lines = content.split("\n");
    let lutSize = 0;
    const headerLines = [];
    const dataValues = [];
    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed === "" || trimmed.startsWith("#") || trimmed.startsWith("TITLE")) {
            headerLines.push(line);
            continue;
        }
        const sizeMatch = trimmed.match(/^LUT_3D_SIZE\s+(\d+)/);
        if (sizeMatch) {
            lutSize = parseInt(sizeMatch[1], 10);
            headerLines.push(line);
            continue;
        }
        if (trimmed.startsWith("DOMAIN_MIN") || trimmed.startsWith("DOMAIN_MAX")) {
            headerLines.push(line);
            continue;
        }
        const parts = trimmed.split(/\s+/);
        if (parts.length === 3) {
            const [r, g, b] = parts.map(Number);
            if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
                dataValues.push([r, g, b]);
                continue;
            }
        }
        headerLines.push(line);
    }
    if (lutSize === 0) {
        throw new Error("Could not find LUT_3D_SIZE in CUBE file");
    }
    const expectedEntries = lutSize * lutSize * lutSize;
    if (dataValues.length !== expectedEntries) {
        throw new Error(`CUBE file has ${dataValues.length} entries but LUT_3D_SIZE ${lutSize} expects ${expectedEntries}`);
    }
    // Build 3D LUT array (CUBE format: R changes fastest, B slowest)
    const lutData = [];
    for (let r = 0; r < lutSize; r++) {
        lutData[r] = [];
        for (let g = 0; g < lutSize; g++) {
            lutData[r][g] = [];
        }
    }
    for (let i = 0; i < dataValues.length; i++) {
        const r = i % lutSize;
        const g = Math.floor(i / lutSize) % lutSize;
        const b = Math.floor(i / (lutSize * lutSize));
        lutData[r][g][b] = dataValues[i];
    }
    // Resample: for each grid point in AWG4/LogC3 space
    // Write in R-fastest order (CUBE convention)
    const newData = [];
    for (let bi = 0; bi < lutSize; bi++) {
        for (let gi = 0; gi < lutSize; gi++) {
            for (let ri = 0; ri < lutSize; ri++) {
                // Grid position in LogC3 space (but AWG4 gamut)
                const rLogC3 = ri / (lutSize - 1);
                const gLogC3 = gi / (lutSize - 1);
                const bLogC3 = bi / (lutSize - 1);
                // Step 1: Decode LogC3 → linear (AWG4 linear)
                const rLinear = logC3ToLinear(rLogC3);
                const gLinear = logC3ToLinear(gLogC3);
                const bLinear = logC3ToLinear(bLogC3);
                // Step 2: Apply AWG4 → AWG3 gamut matrix
                const [rAwg3, gAwg3, bAwg3] = applyMatrix(AWG4_TO_AWG3_MATRIX, rLinear, gLinear, bLinear);
                // Step 3: Encode back to LogC3 (now AWG3/LogC3)
                const rLookup = clamp01(linearToLogC3(rAwg3));
                const gLookup = clamp01(linearToLogC3(gAwg3));
                const bLookup = clamp01(linearToLogC3(bAwg3));
                // Step 4: Look up in original AWG3/LogC3 LUT
                const [outR, outG, outB] = trilinearInterpolate(lutData, lutSize, rLookup, gLookup, bLookup);
                newData.push(`${outR.toFixed(10)} ${outG.toFixed(10)} ${outB.toFixed(10)}`);
            }
        }
    }
    const updatedHeader = headerLines.map((line) => {
        if (line.includes("Source color space")) {
            return "# Source color space AWG4/D65/LogC3";
        }
        return line;
    });
    const output = [...updatedHeader, ...newData, ""].join("\n");
    await writeFile(outputPath, output, "utf-8");
}
/** Convert LogC3 to linear */
function logC3ToLinear(x) {
    const cut = LOGC3.e * LOGC3.cut + LOGC3.f;
    if (x > cut) {
        return (Math.pow(10, (x - LOGC3.d) / LOGC3.c) - LOGC3.b) / LOGC3.a;
    }
    return (x - LOGC3.f) / LOGC3.e;
}
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
export async function convertCubeAwg4LogC4ToAwg3LogC3(inputPath, outputPath) {
    const content = await readFile(inputPath, "utf-8");
    const lines = content.split("\n");
    // Parse the CUBE file
    let lutSize = 0;
    const headerLines = [];
    const dataValues = [];
    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed === "" || trimmed.startsWith("#") || trimmed.startsWith("TITLE")) {
            headerLines.push(line);
            continue;
        }
        const sizeMatch = trimmed.match(/^LUT_3D_SIZE\s+(\d+)/);
        if (sizeMatch) {
            lutSize = parseInt(sizeMatch[1], 10);
            headerLines.push(line);
            continue;
        }
        if (trimmed.startsWith("DOMAIN_MIN") || trimmed.startsWith("DOMAIN_MAX")) {
            headerLines.push(line);
            continue;
        }
        // Parse RGB triplet
        const parts = trimmed.split(/\s+/);
        if (parts.length === 3) {
            const [r, g, b] = parts.map(Number);
            if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
                dataValues.push([r, g, b]);
                continue;
            }
        }
        // Unknown line, preserve
        headerLines.push(line);
    }
    if (lutSize === 0) {
        throw new Error("Could not find LUT_3D_SIZE in CUBE file");
    }
    const expectedEntries = lutSize * lutSize * lutSize;
    if (dataValues.length !== expectedEntries) {
        throw new Error(`CUBE file has ${dataValues.length} entries but LUT_3D_SIZE ${lutSize} expects ${expectedEntries}`);
    }
    // Build 3D array from flat data (CUBE format: R changes fastest, B slowest)
    const lutData = [];
    for (let r = 0; r < lutSize; r++) {
        lutData[r] = [];
        for (let g = 0; g < lutSize; g++) {
            lutData[r][g] = [];
        }
    }
    for (let i = 0; i < dataValues.length; i++) {
        const r = i % lutSize;
        const g = Math.floor(i / lutSize) % lutSize;
        const b = Math.floor(i / (lutSize * lutSize));
        lutData[r][g][b] = dataValues[i];
    }
    // Resample: for each grid point in AWG4/LogC4 space, convert to AWG3/LogC3
    // and look up in original LUT
    // Write in R-fastest order (CUBE convention)
    const newData = [];
    for (let bi = 0; bi < lutSize; bi++) {
        for (let gi = 0; gi < lutSize; gi++) {
            for (let ri = 0; ri < lutSize; ri++) {
                // Grid position in 0-1 (AWG4/LogC4 input space)
                const rLogC4 = ri / (lutSize - 1);
                const gLogC4 = gi / (lutSize - 1);
                const bLogC4 = bi / (lutSize - 1);
                // Step 1: Decode LogC4 → linear (AWG4 linear)
                const rLinear = logC4ToLinear(rLogC4);
                const gLinear = logC4ToLinear(gLogC4);
                const bLinear = logC4ToLinear(bLogC4);
                // Step 2: Apply AWG4 → AWG3 gamut matrix
                const [rAwg3Linear, gAwg3Linear, bAwg3Linear] = applyMatrix(AWG4_TO_AWG3_MATRIX, rLinear, gLinear, bLinear);
                // Step 3: Encode linear → LogC3 (and clamp to valid range)
                const rLogC3 = clamp01(linearToLogC3(rAwg3Linear));
                const gLogC3 = clamp01(linearToLogC3(gAwg3Linear));
                const bLogC3 = clamp01(linearToLogC3(bAwg3Linear));
                // Step 4: Look up in original AWG3/LogC3 LUT with trilinear interpolation
                // Output is Rec.709 values - keep unchanged
                const [outR, outG, outB] = trilinearInterpolate(lutData, lutSize, rLogC3, gLogC3, bLogC3);
                newData.push(`${outR.toFixed(10)} ${outG.toFixed(10)} ${outB.toFixed(10)}`);
            }
        }
    }
    // Update header: Source is now AWG4/LogC4
    const updatedHeader = headerLines.map((line) => {
        if (line.includes("Source color space")) {
            return "# Source color space AWG4/D65/LogC4";
        }
        // Keep target as Rec.709 - this is a display-referred LUT
        return line;
    });
    // Write output CUBE
    const output = [...updatedHeader, ...newData, ""].join("\n");
    await writeFile(outputPath, output, "utf-8");
}
//# sourceMappingURL=logc-converter.service.js.map