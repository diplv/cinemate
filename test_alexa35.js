const { calculateMediaCapacity } = require("./backend/dist/services/pipeline.service.js"); // Wait, let's just write the pure math

// For ARRI Alexa 35: A 1TB Codex Compact Drive is actually 960GB usable (0.96 multiplier)
// Let's print the Alexa 35 4.6K OG time at 24fps on 1TB card with and without multiplier

const totalUsableMB_1TB = 1000 * 1000 * 0.96; // 960,000 MB
const frameSizeMB_46K_OG = 23.7; // ARRIRAW 4.6K OG
const fps = 24;

const totalSeconds = totalUsableMB_1TB / (frameSizeMB_46K_OG * fps);
console.log(`Alexa 35 1TB 4.6K OG 24fps: ${Math.floor(totalSeconds / 60)}m ${Math.floor(totalSeconds % 60)}s`);

// 960,000 / (23.7 * 24) = 1687 seconds = 28m 07s
// The official ARRI spec says 4.6K OG on 1TB is ~28 minutes. Matches perfectly.
