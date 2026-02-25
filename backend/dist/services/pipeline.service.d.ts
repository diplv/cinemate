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
export type PipelineMode = "DIAGNOSTIC" | "SCENARIO_A_IDENTITY" | "SCENARIO_A_GAMUT_CMT" | "SCENARIO_A_INVERSE_CMT" | "SCENARIO_B_CONVERTED_DRT" | "SCENARIO_B_FULL_CONVERTED_DRT";
export interface PipelineResult {
    cubeLogC3: {
        path: string;
        name: string;
        size: number;
    };
    cubeLogC4: {
        path: string;
        name: string;
        size: number;
    };
    lookFile: {
        path: string;
        name: string;
        size: number;
        format: string;
    };
}
/**
 * Execute the LUT conversion pipeline based on the active mode.
 */
export declare function executePipeline(inputPath: string, workDir: string, originalName: string, mode?: PipelineMode): Promise<PipelineResult>;
/**
 * Scenario A with identity CMT.
 * Use when ART handles both gamut (AWG4→AWG3) and transfer (LogC4→LogC3) automatically.
 */
export declare function executePipelineScenarioA_Identity(inputPath: string, workDir: string, originalName: string): Promise<PipelineResult>;
/**
 * Scenario A with gamut conversion CMT.
 * Use when ART only converts transfer (LogC4→LogC3) but NOT gamut.
 * CMT converts AWG4→AWG3, then ART converts LogC4→LogC3.
 */
export declare function executePipelineScenarioA_GamutCmt(inputPath: string, workDir: string, originalName: string): Promise<PipelineResult>;
/**
 * Scenario A with INVERSE gamut CMT.
 * Try this if SCENARIO_A_GAMUT_CMT produces the opposite color shift.
 */
export declare function executePipelineScenarioA_InverseCmt(inputPath: string, workDir: string, originalName: string): Promise<PipelineResult>;
/**
 * Scenario B with converted DRT (LogC3 input).
 * Use when CMT slot is NOT being applied by ART.
 * Bakes AWG4→AWG3 gamut conversion directly into the DRT LUT.
 * Assumes ART converts LogC4→LogC3 (transfer only) before DRT.
 */
export declare function executePipelineScenarioB_ConvertedDrt(inputPath: string, workDir: string, originalName: string): Promise<PipelineResult>;
/**
 * Scenario B with FULLY converted DRT (LogC4 input).
 * Use when CMT is NOT applied AND ART doesn't convert transfer either.
 * Bakes BOTH AWG4→AWG3 gamut AND LogC4→LogC3 transfer into the DRT.
 * DRT expects raw AWG4/LogC4 camera output.
 */
export declare function executePipelineScenarioB_FullConvertedDrt(inputPath: string, workDir: string, originalName: string): Promise<PipelineResult>;
/**
 * Diagnostic pipeline that swaps R/B channels in CMT.
 * Use to verify if CMT slot is being applied by ART.
 *
 * If you see red/blue swapped in ART: CMT IS working → use Scenario A
 * If colors look normal (no swap): CMT NOT working → use Scenario B
 */
export declare function executePipelineDiagnostic(inputPath: string, workDir: string, originalName: string): Promise<PipelineResult>;
//# sourceMappingURL=pipeline.service.d.ts.map