/**
 * Parses an ARRI AML (Look File 2) XML structure to extract the embedded 3D LUT,
 * reconstructs it into a standard Adobe .cube format, and saves it to a temp file.
 * Returns the path to the extracted .cube file.
 */
export declare function convertAmlToCube(fileBuffer: Buffer): Promise<string>;
//# sourceMappingURL=aml-extractor.service.d.ts.map