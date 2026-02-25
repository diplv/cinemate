/**
 * Parse an AML (ARRI Metadata Language) look file and extract the 3D LUT
 * as a CUBE file. AML files are XML-based and contain CDL values and/or
 * embedded 3D LUT data, or can be compiled into a binary KOLA format.
 */
export declare function extractCubeFromAml(amlPath: string, cubeOutputPath: string): Promise<void>;
//# sourceMappingURL=aml-parser.service.d.ts.map