import { convertAmlToCube } from "./src/services/aml-extractor.service.js";
import * as fs from "fs";

const mockAml = `<?xml version="1.0" encoding="UTF-8"?>
<Look>
    <LUT3D size="2">
        <Data format="base64">
           AAAAAEAAAABBAAAAQQAAAAFBAAAAQUAAAEEAAABBAAA=
        </Data>
    </LUT3D>
</Look>
`;

// Base64 string for 24 floats (2x2x2=8 floats * 3 channels = 24 floats = 96 bytes)
// But let's build a real base64 string
const floats = new Float32Array(24);
for (let i = 0; i < 24; i++) floats[i] = i * 0.1;
const b1 = Buffer.from(floats.buffer);
const b64 = b1.toString('base64');

const realMockAml = `<?xml version="1.0" encoding="UTF-8"?>
<Look>
    <LUT3D size="2">
        <Data format="base64">${b64}</Data>
    </LUT3D>
</Look>
`;

async function run() {
    const resultCube = await convertAmlToCube(realMockAml);
    console.log("Extracted CUBE to: ", resultCube);
    const cubeContent = fs.readFileSync(resultCube, "utf-8");
    console.log(cubeContent);
}

run().catch(console.error);
