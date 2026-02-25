import { writeFile } from "node:fs/promises";
import * as path from "node:path";
import * as os from "node:os";
/**
 * Parses an ARRI AML (Look File 2) XML structure to extract the embedded 3D LUT,
 * reconstructs it into a standard Adobe .cube format, and saves it to a temp file.
 * Returns the path to the extracted .cube file.
 */
export async function convertAmlToCube(fileBuffer) {
    // Check for ARRI "KOLA" binary signature
    const isBinaryKola = fileBuffer.length >= 4 && fileBuffer.subarray(0, 4).toString("utf-8") === "KOLA";
    let lutSize = 33; // Default to 33x33x33 per user specification
    let cubeLines = [];
    if (isBinaryKola) {
        console.log("=== DETECTED KOLA BINARY AML FORMAT ===");
        // For ARRI Look File 2 binary, the 3D LUT is stored at the end of the file.
        // It consists of 16-bit unsigned integers linearly mapped to 0.0 - 1.0.
        // Size: 33 * 33 * 33 * 3 channels * 2 bytes = 215,622 bytes.
        const expectedBytes = lutSize * lutSize * lutSize * 3 * 2;
        if (fileBuffer.length < expectedBytes) {
            throw new Error("KOLA binary file is too short to contain a 33x33x33 3D LUT.");
        }
        const dataOffset = fileBuffer.length - expectedBytes;
        const lutData = fileBuffer.subarray(dataOffset);
        cubeLines = [
            `TITLE "Extracted from ARRI Look File 2 Binary (KOLA)"`,
            `LUT_3D_SIZE ${lutSize}`,
            `DOMAIN_MIN 0.0 0.0 0.0`,
            `DOMAIN_MAX 1.0 1.0 1.0`,
            ``,
        ];
        let offset = 0;
        // Adobe cube: R changes fastest, B slowest
        for (let bi = 0; bi < lutSize; bi++) {
            for (let gi = 0; gi < lutSize; gi++) {
                for (let ri = 0; ri < lutSize; ri++) {
                    const r = (lutData.readUInt16LE(offset) / 65535.0).toFixed(6);
                    const g = (lutData.readUInt16LE(offset + 2) / 65535.0).toFixed(6);
                    const b = (lutData.readUInt16LE(offset + 4) / 65535.0).toFixed(6);
                    cubeLines.push(`${r} ${g} ${b}`);
                    offset += 6;
                }
            }
        }
    }
    else {
        console.log("=== DETECTED XML TEXT AML FORMAT ===");
        const amlContent = fileBuffer.toString("utf-8");
        // Find LUT3D
        const lut3dMatch = amlContent.match(/<(?:[\w-]+:)?LUT3D/i);
        if (!lut3dMatch) {
            console.error("Failed to parse Text AML. Content started with:", amlContent.substring(0, 200));
            throw new Error(`Could not find <LUT3D> node inside the provided AML file. Content starts with: ${amlContent.substring(0, 100).replace(/\n/g, '\\n')}`);
        }
        const sizeMatch = amlContent.match(/<(?:[\w-]+:)?LUT3D[^>]*size=["']?(\d+)["']?/i);
        if (sizeMatch && sizeMatch[1]) {
            lutSize = parseInt(sizeMatch[1], 10);
        }
        // Find Data tag and its format
        const dataMatch = amlContent.match(/<(?:[\w-]+:)?Data([^>]*)>([\s\S]*?)<\/(?:[\w-]+:)?Data>/i);
        if (!dataMatch) {
            throw new Error("Could not find <Data> node inside the XML AML file.");
        }
        const dataAttributes = dataMatch[1];
        const rawData = dataMatch[2].trim();
        const isBase64 = /format=["']?base64["']?/i.test(dataAttributes);
        if (!rawData) {
            throw new Error("No data content found in <Data> node.");
        }
        let floatData = [];
        if (isBase64) {
            const buffer = Buffer.from(rawData, "base64");
            for (let i = 0; i < buffer.length; i += 4) {
                if (i + 4 <= buffer.length) {
                    floatData.push(buffer.readFloatLE(i));
                }
            }
        }
        else {
            floatData = rawData
                .split(/[\s,]+/)
                .map(Number)
                .filter((n) => !isNaN(n));
        }
        const expectedEntries = lutSize * lutSize * lutSize * 3;
        if (floatData.length !== expectedEntries) {
            throw new Error(`LUT3D size ${lutSize} expects ${expectedEntries} floats, but got ${floatData.length}`);
        }
        cubeLines = [
            `TITLE "Extracted from ARRI Look File 2 XML (AML)"`,
            `LUT_3D_SIZE ${lutSize}`,
            `DOMAIN_MIN 0.0 0.0 0.0`,
            `DOMAIN_MAX 1.0 1.0 1.0`,
            ``,
        ];
        for (let bi = 0; bi < lutSize; bi++) {
            for (let gi = 0; gi < lutSize; gi++) {
                for (let ri = 0; ri < lutSize; ri++) {
                    const flatIndex = (ri + gi * lutSize + bi * lutSize * lutSize) * 3;
                    const r = floatData[flatIndex];
                    const g = floatData[flatIndex + 1];
                    const b = floatData[flatIndex + 2];
                    cubeLines.push(`${r.toFixed(6)} ${g.toFixed(6)} ${b.toFixed(6)}`);
                }
            }
        }
    }
    const tmpCubePath = path.join(os.tmpdir(), `extracted_${Date.now()}.cube`);
    await writeFile(tmpCubePath, cubeLines.join("\n"), "utf-8");
    return tmpCubePath;
}
//# sourceMappingURL=aml-extractor.service.js.map