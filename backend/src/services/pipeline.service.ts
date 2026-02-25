import { join, extname, dirname } from "node:path";
import { copyFile, access, stat } from "node:fs/promises";
import { constants } from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import {
  generateIdentityCmtCube,
  generateGamutConversionCmtCube,
  generateInverseGamutCmtCube,
  generateDiagnosticCmtCube,
  convertCubeAwg4LogC3ToAwg3LogC3,
  convertCubeAwg4LogC4ToAwg3LogC3,
} from "./logc-converter.service.js";
import { extractCubeFromAml } from "./aml-parser.service.js";

const execFileAsync = promisify(execFile);

// Resolve path relative to this file's location
const __dirname = dirname(fileURLToPath(import.meta.url));
// Path to look-builder CLI: backend/dist/services -> backend -> project root -> art-cmd
const LOOK_BUILDER_PATH = process.env.LOOK_BUILDER_PATH || 
  join(__dirname, "../../../art-cmd_1.0.0_macos_universal/bin/look-builder");

/**
 * Pipeline conversion mode - determines how color space conversion is handled.
 * 
 * DIAGNOSTIC: R/B channel swap in CMT to verify CMT is being applied
 * 
 * SCENARIO_A_IDENTITY: Identity CMT + original LogC3 DRT
 *   - Use if ART handles both gamut AND transfer conversion automatically
 * 
 * SCENARIO_A_GAMUT_CMT: AWG4→AWG3 gamut conversion in CMT + original LogC3 DRT
 *   - Use if ART only converts transfer (LogC4→LogC3) but NOT gamut
 *   - CMT does: AWG4→AWG3 gamut in LogC4 space
 *   - ART then converts: LogC4→LogC3
 *   - DRT receives: AWG3/LogC3 (correct)
 * 
 * SCENARIO_A_INVERSE_CMT: AWG3→AWG4 inverse gamut in CMT (if colors shift wrong way)
 *   - Try this if SCENARIO_A_GAMUT_CMT produces opposite color shift
 * 
 * SCENARIO_B_CONVERTED_DRT: Identity CMT + gamut-converted DRT (LogC3 input)
 *   - Use if CMT is NOT applied AND ART converts LogC4→LogC3 before DRT
 *   - Bakes AWG4→AWG3 gamut conversion directly into DRT
 *   - DRT expects: AWG4/LogC3 (what ART outputs after transfer-only conversion)
 * 
 * SCENARIO_B_FULL_CONVERTED_DRT: Identity CMT + fully converted DRT (LogC4 input)
 *   - Use if CMT is NOT applied AND ART does NOT convert transfer either
 *   - Bakes BOTH AWG4→AWG3 gamut AND LogC4→LogC3 transfer into DRT
 *   - DRT expects: AWG4/LogC4 (raw camera output)
 */
export type PipelineMode = 
  | "DIAGNOSTIC"
  | "SCENARIO_A_IDENTITY"
  | "SCENARIO_A_GAMUT_CMT"
  | "SCENARIO_A_INVERSE_CMT"
  | "SCENARIO_B_CONVERTED_DRT"
  | "SCENARIO_B_FULL_CONVERTED_DRT";

// Current active mode - ARRI docs confirm DRT expects AWG4/LogC4 input directly.
// SCENARIO_B_FULL_CONVERTED_DRT bakes both AWG4→AWG3 gamut AND LogC4→LogC3 transfer
// into the DRT so it accepts AWG4/LogC4 and outputs Rec.709.
const ACTIVE_MODE: PipelineMode = "SCENARIO_B_FULL_CONVERTED_DRT";

export interface PipelineResult {
  cubeLogC3: { path: string; name: string; size: number };
  cubeLogC4: { path: string; name: string; size: number };
  lookFile: { path: string; name: string; size: number; format: string };
}

async function getFileSize(filePath: string): Promise<number> {
  const stats = await stat(filePath);
  return stats.size;
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath, constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Execute the LUT conversion pipeline based on the active mode.
 */
export async function executePipeline(
  inputPath: string,
  workDir: string,
  originalName: string,
  mode: PipelineMode = ACTIVE_MODE
): Promise<PipelineResult> {
  const ext = extname(originalName).toLowerCase();
  const baseName = originalName.replace(/\.(aml|cube)$/i, "");
  const cubePath = join(workDir, `${baseName}.cube`);
  const cmtPath = join(workDir, "cmt.cube");
  const convertedDrtPath = join(workDir, `${baseName}_converted.cube`);
  const alf4cPath = join(workDir, `${baseName}.alf4c`);

  // Step 1: Get CUBE (LogC3) - extract from AML or copy directly
  if (ext === ".aml") {
    await extractCubeFromAml(inputPath, cubePath);
  } else if (ext === ".cube") {
    await copyFile(inputPath, cubePath);
  } else {
    throw new Error(`Unsupported file type: ${ext}. Upload .aml or .cube files.`);
  }

  if (!(await fileExists(cubePath))) {
    throw new Error("Failed to obtain CUBE file from input");
  }

  // Step 2 & 3: Generate CMT and DRT based on mode
  let drtPath = cubePath; // Default: use original CUBE as DRT

  switch (mode) {
    case "DIAGNOSTIC":
      // R/B channel swap to verify CMT is applied
      await generateDiagnosticCmtCube(cmtPath, 17);
      break;

    case "SCENARIO_A_IDENTITY":
      // Identity CMT - assumes ART handles all conversion
      await generateIdentityCmtCube(cmtPath, 17);
      break;

    case "SCENARIO_A_GAMUT_CMT":
      // AWG4→AWG3 gamut conversion in CMT
      await generateGamutConversionCmtCube(cmtPath, 33);
      break;

    case "SCENARIO_A_INVERSE_CMT":
      // AWG3→AWG4 inverse gamut (try if colors shift wrong way)
      await generateInverseGamutCmtCube(cmtPath, 33);
      break;

    case "SCENARIO_B_CONVERTED_DRT":
      // Identity CMT + gamut conversion baked into DRT (expects LogC3 input)
      await generateIdentityCmtCube(cmtPath, 17);
      await convertCubeAwg4LogC3ToAwg3LogC3(cubePath, convertedDrtPath);
      drtPath = convertedDrtPath;
      break;

    case "SCENARIO_B_FULL_CONVERTED_DRT":
      // Identity CMT + FULL conversion baked into DRT (expects LogC4 input)
      // Bakes both AWG4→AWG3 gamut AND LogC4→LogC3 transfer into the DRT
      await generateIdentityCmtCube(cmtPath, 17);
      await convertCubeAwg4LogC4ToAwg3LogC3(cubePath, convertedDrtPath);
      drtPath = convertedDrtPath;
      break;

    default:
      throw new Error(`Unknown pipeline mode: ${mode}`);
  }

  // Step 4: Create ALF4c using look-builder
  try {
    await execFileAsync(LOOK_BUILDER_PATH, [
      "-l", cmtPath, "-c", "AWG4/D65/LogC4",              // CMT
      "-l", drtPath, "-c", "Rec.709/D65/BT.1886",         // SDR DRT
      "-l", drtPath, "-c", "Rec.2020/D65/PQ",             // HDR DRT
      "-o", alf4cPath,
    ]);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`look-builder failed: ${message}`);
  }

  if (!(await fileExists(alf4cPath))) {
    throw new Error("ALF4c creation failed - no output file");
  }

  return {
    cubeLogC3: {
      path: cubePath,
      name: `${baseName}.cube`,
      size: await getFileSize(cubePath),
    },
    cubeLogC4: {
      path: drtPath,
      name: `${baseName}.cube`,
      size: await getFileSize(drtPath),
    },
    lookFile: {
      path: alf4cPath,
      name: `${baseName}.alf4c`,
      size: await getFileSize(alf4cPath),
      format: "ALF4c",
    },
  };
}

// ============================================================================
// SCENARIO A PIPELINE: CMT is applied by ART
// ============================================================================

/**
 * Scenario A with identity CMT.
 * Use when ART handles both gamut (AWG4→AWG3) and transfer (LogC4→LogC3) automatically.
 */
export async function executePipelineScenarioA_Identity(
  inputPath: string,
  workDir: string,
  originalName: string
): Promise<PipelineResult> {
  return executePipeline(inputPath, workDir, originalName, "SCENARIO_A_IDENTITY");
}

/**
 * Scenario A with gamut conversion CMT.
 * Use when ART only converts transfer (LogC4→LogC3) but NOT gamut.
 * CMT converts AWG4→AWG3, then ART converts LogC4→LogC3.
 */
export async function executePipelineScenarioA_GamutCmt(
  inputPath: string,
  workDir: string,
  originalName: string
): Promise<PipelineResult> {
  return executePipeline(inputPath, workDir, originalName, "SCENARIO_A_GAMUT_CMT");
}

/**
 * Scenario A with INVERSE gamut CMT.
 * Try this if SCENARIO_A_GAMUT_CMT produces the opposite color shift.
 */
export async function executePipelineScenarioA_InverseCmt(
  inputPath: string,
  workDir: string,
  originalName: string
): Promise<PipelineResult> {
  return executePipeline(inputPath, workDir, originalName, "SCENARIO_A_INVERSE_CMT");
}

// ============================================================================
// SCENARIO B PIPELINE: CMT is NOT applied by ART
// ============================================================================

/**
 * Scenario B with converted DRT (LogC3 input).
 * Use when CMT slot is NOT being applied by ART.
 * Bakes AWG4→AWG3 gamut conversion directly into the DRT LUT.
 * Assumes ART converts LogC4→LogC3 (transfer only) before DRT.
 */
export async function executePipelineScenarioB_ConvertedDrt(
  inputPath: string,
  workDir: string,
  originalName: string
): Promise<PipelineResult> {
  return executePipeline(inputPath, workDir, originalName, "SCENARIO_B_CONVERTED_DRT");
}

/**
 * Scenario B with FULLY converted DRT (LogC4 input).
 * Use when CMT is NOT applied AND ART doesn't convert transfer either.
 * Bakes BOTH AWG4→AWG3 gamut AND LogC4→LogC3 transfer into the DRT.
 * DRT expects raw AWG4/LogC4 camera output.
 */
export async function executePipelineScenarioB_FullConvertedDrt(
  inputPath: string,
  workDir: string,
  originalName: string
): Promise<PipelineResult> {
  return executePipeline(inputPath, workDir, originalName, "SCENARIO_B_FULL_CONVERTED_DRT");
}

// ============================================================================
// DIAGNOSTIC PIPELINE
// ============================================================================

/**
 * Diagnostic pipeline that swaps R/B channels in CMT.
 * Use to verify if CMT slot is being applied by ART.
 * 
 * If you see red/blue swapped in ART: CMT IS working → use Scenario A
 * If colors look normal (no swap): CMT NOT working → use Scenario B
 */
export async function executePipelineDiagnostic(
  inputPath: string,
  workDir: string,
  originalName: string
): Promise<PipelineResult> {
  return executePipeline(inputPath, workDir, originalName, "DIAGNOSTIC");
}
