const data = [
  { name: "Arriraw 3.4k og", size: 512, timeStr: "28:35", fps: 25 },
  { name: "Arriraw 3.4k og", size: 256, timeStr: "14:15", fps: 25 }, // corrected typo from user data 24:15 -> 14:15 probably
  { name: "Arriraw 2.8k", size: 512, timeStr: "46:06", fps: 25 },
  { name: "Arriraw 2.8k", size: 256, timeStr: "23:03", fps: 25 }, // extrapolated
  { name: "Prores 4444 XQ 4:3 2.8k", size: 512, timeStr: "45:26", fps: 25 },
  { name: "Prores 4444 XQ 4:3 2.8k", size: 256, timeStr: "22:43", fps: 25 },
  { name: "Prores 4444 XQ 3.2k", size: 512, timeStr: "50:09", fps: 25 },
  { name: "Prores 4444 4:3 2.8k", size: 128, timeStr: "17:01", fps: 25 },
  { name: "Prores 422 HQ 4:3 2.8k", size: 128, timeStr: "25:29", fps: 25 },
  { name: "Prores 422 4:3 2.8k", size: 128, timeStr: "38:09", fps: 25 },
  { name: "Prores 422 LT 4:3 2.8k", size: 128, timeStr: "54:31", fps: 25 },
];

// ARRI typically uses a usable capacity multiplier around 0.95 to 0.96 for CFast 2.0
// Let's deduce it. If we assume frameSize is constant.
// 512GB card time for 3.4k OG: 28m 35s = 1715 seconds
// 128GB card time for 3.4k OG: 07m 08s = 428 seconds
// 1715 / 428 = 4.007 (Perfect 4x scaling, meaning 512GB is exactly 4x 128GB in usable space).
// Let's assume CFast 2.0 cards usable space is total * multiplier.
// For CFast 2.0, formatted capacity is usually 1GB = 1,000,000,000 bytes exactly OR GiB.
// Actually ARRI CFast cards usually yield ~120GB usable for a 128GB card (128 * 0.941)
// Let's calculate frame sizes assuming usable space = cardSize * 0.96
// formula: frameSizeMB = (cardGB * 1000 * 0.94) / (totalSeconds * fps)

const usableMultiplier = 0.96; // We'll test this

console.log(`Usable Multiplier Assumption: ${usableMultiplier}`);
console.log("-------------------------------------------------");

data.forEach(d => {
  const [min, sec] = d.timeStr.split(':').map(Number);
  const totalSeconds = (min * 60) + sec;
  const frameSizeMB = (d.size * Math.pow(1024, 3) / 1000000) * usableMultiplier / (totalSeconds * d.fps) ;
  const legacyFrameSizeMB = (d.size * 1000 * usableMultiplier) / (totalSeconds * d.fps);
  
  console.log(`${d.name} (${d.size}GB): Time: ${totalSeconds}s | FrameSize (Base 1000): ${legacyFrameSizeMB.toFixed(2)} MB/f | FrameSize (Base 1024): ${frameSizeMB.toFixed(2)} MB/f`);
});
