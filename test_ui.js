import { calculateMediaCapacity } from "./lib/media-calculations.js"; // Needs TS compilation, let's use a pure JS replica of our code to test the math
const cardSizeGB = 512;
const frameSizeMB = 11.46;
const fps = 25;
const usableMultiplier = 0.9609;

// Calculate total seconds using the usable capacity
const totalUsableMB = cardSizeGB * 1000 * usableMultiplier;
const totalSeconds = totalUsableMB / (frameSizeMB * fps);

const hours = Math.floor(totalSeconds / 3600);
const minutes = Math.floor((totalSeconds % 3600) / 60);
const seconds = Math.floor(totalSeconds % 60);

console.log(`New logic: ${hours}h ${minutes}m ${seconds}s (total: ${totalSeconds}s)`);

// Old logic:
const totalSecondsOld = (cardSizeGB * 1000) / (11.5 * fps);
const hoursOld = Math.floor(totalSecondsOld / 3600);
const minutesOld = Math.floor((totalSecondsOld % 3600) / 60);
const secondsOld = Math.floor(totalSecondsOld % 60);
console.log(`Old logic: ${hoursOld}h ${minutesOld}m ${secondsOld}s (total: ${totalSecondsOld}s)`);
