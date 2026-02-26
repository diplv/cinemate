export interface Codec {
  name: string;
  frameSizeMB: number; // Frame size in megabytes
  supportedFramerates: number[];
}

export interface CameraCodecProfile {
  cameraId: string;
  mediaType: string;
  cardSizes: number[]; // in GB
  usableCapacityMultiplier?: number; // E.g., 0.96 for CFast 2.0 where 128GB yields ~120GB usable
  codecs: Codec[];
}

export const CODEC_DATABASE: CameraCodecProfile[] = [
  // --- ARRI ---
  {
    cameraId: "arri-alexa-35",
    mediaType: "Codex Compact Drive",
    cardSizes: [1000, 2000],
    usableCapacityMultiplier: 0.96,
    codecs: [
      // ARRIRAW modes (frame sizes from ARRI spec PDF v6.1)
      { name: "ARRIRAW 4.6K 3:2 OG", frameSizeMB: 23.7, supportedFramerates: [24, 25, 30, 35] },
      { name: "ARRIRAW 4.6K 16:9", frameSizeMB: 19.4, supportedFramerates: [24, 25, 30, 45] },
      { name: "ARRIRAW 4K 16:9", frameSizeMB: 15.4, supportedFramerates: [24, 25, 30, 48, 50, 55] },
      { name: "ARRIRAW 3.8K 16:9 UHD", frameSizeMB: 13.5, supportedFramerates: [24, 25, 30, 48, 50, 60, 65] },
      { name: "ARRIRAW 3.8K 2.39:1", frameSizeMB: 10.21, supportedFramerates: [24, 25, 30, 48, 50, 60, 85] },
      { name: "ARRIRAW 3.3K 6:5", frameSizeMB: 15.1, supportedFramerates: [24, 25, 30, 48, 50, 55] },
      { name: "ARRIRAW 2K S16", frameSizeMB: 4.01, supportedFramerates: [24, 25, 30, 48, 50, 60, 120, 230] },
      { name: "ARRIRAW HD S16", frameSizeMB: 3.55, supportedFramerates: [24, 25, 30, 48, 50, 60, 120, 260] },
      // ARRICORE modes
      { name: "ARRICORE 4.6K 3:2 OG", frameSizeMB: 10.76, supportedFramerates: [24, 25, 30, 48, 50, 60, 80] },
      { name: "ARRICORE 4.6K 16:9", frameSizeMB: 8.84, supportedFramerates: [24, 25, 30, 48, 50, 60, 100] },
      { name: "ARRICORE 4K 16:9", frameSizeMB: 7.23, supportedFramerates: [24, 25, 30, 48, 50, 60, 90, 125] },
      { name: "ARRICORE 3.8K UHD", frameSizeMB: 6.19, supportedFramerates: [24, 25, 30, 48, 50, 60, 120, 145] },
      // ProRes modes (estimated frame sizes for 4444)
      { name: "ProRes 4444 4.6K OG", frameSizeMB: 8.5, supportedFramerates: [24, 25, 30, 48, 50, 60] },
      { name: "ProRes 4444 4.6K 16:9", frameSizeMB: 7.0, supportedFramerates: [24, 25, 30, 48, 50, 60, 70] },
      { name: "ProRes 4444 4K 16:9", frameSizeMB: 5.5, supportedFramerates: [24, 25, 30, 48, 50, 60, 90] },
      { name: "ProRes 4444 UHD", frameSizeMB: 5.0, supportedFramerates: [24, 25, 30, 48, 50, 60, 105] },
      { name: "ProRes 422 HQ 4K", frameSizeMB: 3.5, supportedFramerates: [24, 25, 30, 48, 50, 60, 90, 150] },
      { name: "ProRes 422 HQ 2K", frameSizeMB: 0.9, supportedFramerates: [24, 25, 30, 48, 50, 60, 120, 150] },
      { name: "ProRes 422 HQ HD", frameSizeMB: 0.8, supportedFramerates: [24, 25, 30, 48, 50, 60, 120, 150] },
    ],
  },
  {
    cameraId: "arri-alexa-35-xtreme",
    mediaType: "Codex Compact Drive",
    cardSizes: [1000, 2000],
    usableCapacityMultiplier: 0.96,
    codecs: [
      // ARRIRAW modes with higher fps (Premium/Xtreme license)
      { name: "ARRIRAW 4.6K 3:2 OG", frameSizeMB: 23.7, supportedFramerates: [24, 25, 30, 48, 50, 60, 80] },
      { name: "ARRIRAW 4.6K 16:9", frameSizeMB: 19.4, supportedFramerates: [24, 25, 30, 48, 50, 60, 95] },
      { name: "ARRIRAW 4K 16:9", frameSizeMB: 15.4, supportedFramerates: [24, 25, 30, 48, 50, 60, 120, 125] },
      { name: "ARRIRAW 3.8K UHD", frameSizeMB: 13.5, supportedFramerates: [24, 25, 30, 48, 50, 60, 120, 140] },
      { name: "ARRIRAW 3.8K 2.39:1", frameSizeMB: 10.21, supportedFramerates: [24, 25, 30, 48, 50, 60, 120, 190] },
      { name: "ARRIRAW 3.3K 6:5", frameSizeMB: 15.1, supportedFramerates: [24, 25, 30, 48, 50, 60, 120] },
      { name: "ARRIRAW 2K S16", frameSizeMB: 4.01, supportedFramerates: [24, 25, 30, 48, 50, 60, 120, 240, 330] },
      // ARRICORE modes with Sensor Overdrive
      { name: "ARRICORE 4.6K OG", frameSizeMB: 10.76, supportedFramerates: [24, 25, 30, 48, 50, 60, 120, 165] },
      { name: "ARRICORE 4.6K 16:9", frameSizeMB: 8.84, supportedFramerates: [24, 25, 30, 48, 50, 60, 150, 200] },
      { name: "ARRICORE 4K 16:9", frameSizeMB: 7.23, supportedFramerates: [24, 25, 30, 48, 50, 60, 150, 210] },
      { name: "ARRICORE 3.8K UHD", frameSizeMB: 6.19, supportedFramerates: [24, 25, 30, 48, 50, 60, 150, 240] },
      // ProRes modes
      { name: "ProRes 4444 4K", frameSizeMB: 5.5, supportedFramerates: [24, 25, 30, 48, 50, 60, 120, 150] },
      { name: "ProRes 422 HQ 4K", frameSizeMB: 3.5, supportedFramerates: [24, 25, 30, 48, 50, 60, 120, 150] },
      { name: "ProRes 4444 4.6K OG", frameSizeMB: 8.5, supportedFramerates: [24, 25, 30, 48, 50, 60, 120] },
      { name: "ProRes 4444 4.6K 16:9", frameSizeMB: 7.0, supportedFramerates: [24, 25, 30, 48, 50, 60, 120, 150] },
      { name: "ProRes 4444 UHD", frameSizeMB: 5.0, supportedFramerates: [24, 25, 30, 48, 50, 60, 105, 150] },
      { name: "ProRes 422 HQ 2K", frameSizeMB: 0.9, supportedFramerates: [24, 25, 30, 48, 50, 60, 120, 150, 330] },
      { name: "ProRes 422 HQ HD", frameSizeMB: 0.8, supportedFramerates: [24, 25, 30, 48, 50, 60, 120, 150, 330] },
    ],
  },
  {
    cameraId: "arri-mini-lf",
    mediaType: "CFast 2.0 / Codex Compact Drive",
    cardSizes: [1000, 2000],
    usableCapacityMultiplier: 0.96,
    codecs: [
      // ARRIRAW modes (frame sizes from PDF)
      { name: "ARRIRAW 4.5K LF OG", frameSizeMB: 20.9, supportedFramerates: [24, 25, 30, 40] },
      { name: "ARRIRAW 4.5K LF 2.39:1", frameSizeMB: 12.6, supportedFramerates: [24, 25, 30, 48, 50, 60] },
      { name: "ARRIRAW 3.8K LF 16:9", frameSizeMB: 12.7, supportedFramerates: [24, 25, 30, 48, 50, 60] },
      { name: "ARRIRAW 2.8K LF 1:1", frameSizeMB: 12.4, supportedFramerates: [24, 25, 30, 48, 50, 60] },
      { name: "ARRIRAW 3.4K S35 3:2", frameSizeMB: 11.5, supportedFramerates: [24, 25, 30, 48, 50, 60] },
      // ProRes modes
      { name: "ProRes 4444 4.5K LF OG", frameSizeMB: 8.0, supportedFramerates: [24, 25, 30, 40] },
      { name: "ProRes 4444 4.3K LF UHD", frameSizeMB: 6.0, supportedFramerates: [24, 25, 30, 48] },
      { name: "ProRes 4444 4.3K LF HD", frameSizeMB: 1.5, supportedFramerates: [24, 25, 30, 48, 50, 60, 75] },
      { name: "ProRes 4444 3.8K LF UHD", frameSizeMB: 5.5, supportedFramerates: [24, 25, 30, 48, 50, 60] },
      { name: "ProRes 4444 3.8K LF 2K", frameSizeMB: 1.4, supportedFramerates: [24, 25, 30, 48, 50, 60, 90] },
      { name: "ProRes 4444 3.8K LF HD", frameSizeMB: 1.2, supportedFramerates: [24, 25, 30, 48, 50, 60, 90] },
      { name: "ProRes 4444 2.8K LF 1:1", frameSizeMB: 4.5, supportedFramerates: [24, 25, 30, 48, 50, 60] },
      { name: "ProRes 4444 3.2K S35", frameSizeMB: 3.5, supportedFramerates: [24, 25, 30, 48, 50, 60, 75] },
      { name: "ProRes 4444 2.8K S35 4:3", frameSizeMB: 4.0, supportedFramerates: [24, 25, 30, 48, 50, 60, 75] },
      { name: "ProRes 4444 2.8K S35 HD", frameSizeMB: 1.2, supportedFramerates: [24, 25, 30, 48, 50, 60, 90, 100] },
    ],
  },
  {
    cameraId: "arri-alexa-mini",
    mediaType: "CFast 2.0",
    cardSizes: [128, 256, 512],
    usableCapacityMultiplier: 0.9609, // 123GB usable out of 128GB (128 * 0.9609 = 123)
    codecs: [
      // ARRIRAW modes (empirically matched to user data)
      { name: "ARRIRAW 3.4K OG", frameSizeMB: 11.47, supportedFramerates: [24, 25, 30] },
      { name: "ARRIRAW 2.8K 4:3 (OG 3.4K)", frameSizeMB: 11.47, supportedFramerates: [24, 25, 30] },
      { name: "ARRIRAW 2.8K 16:9", frameSizeMB: 7.11, supportedFramerates: [24, 25, 30, 48] },
      { name: "ARRIRAW 2.39:1 2K Ana (OG 3.4K)", frameSizeMB: 11.47, supportedFramerates: [24, 25, 30] },
      { name: "ARRIRAW 16:9 HD Ana. (OG 3.4K)", frameSizeMB: 11.47, supportedFramerates: [24, 25, 30] },

      // ProRes modes (empirically matched)
      { name: "ProRes 4444 XQ 4:3 2.8K", frameSizeMB: 7.22, supportedFramerates: [24, 25, 30, 48, 50, 60] },
      { name: "ProRes 4444 XQ 3.2K", frameSizeMB: 6.54, supportedFramerates: [24, 25, 30, 48, 50, 60] },
      { name: "ProRes 4444 4:3 2.8K", frameSizeMB: 4.82, supportedFramerates: [24, 25, 30, 48, 50, 60] },
      { name: "ProRes 4444 4K UHD", frameSizeMB: 4.5, supportedFramerates: [24, 25, 30, 48, 50, 60] },
      { name: "ProRes 4444 3.2K", frameSizeMB: 3.5, supportedFramerates: [24, 25, 30, 48, 50, 60] },
      { name: "ProRes 422 HQ 4:3 2.8K", frameSizeMB: 3.22, supportedFramerates: [24, 25, 30, 48, 50, 60] },
      { name: "ProRes 422 4:3 2.8K", frameSizeMB: 2.15, supportedFramerates: [24, 25, 30, 48, 50, 60] },
      { name: "ProRes 422 LT 4:3 2.8K", frameSizeMB: 1.50, supportedFramerates: [24, 25, 30, 48, 50, 60] },

      { name: "ProRes 422 HQ 2K", frameSizeMB: 1.4, supportedFramerates: [24, 25, 30, 48, 50, 60, 120, 200] },
      { name: "ProRes 422 HQ HD", frameSizeMB: 1.2, supportedFramerates: [24, 25, 30, 48, 50, 60, 120, 200] },
      { name: "ProRes 422 HQ S16 HD", frameSizeMB: 0.8, supportedFramerates: [24, 25, 30, 48, 50, 60, 120, 200] },
      { name: "ProRes 2.39:1 2K Ana", frameSizeMB: 1.4, supportedFramerates: [24, 25, 30, 48, 50, 60, 96, 120] },
      { name: "ProRes HD Ana", frameSizeMB: 1.2, supportedFramerates: [24, 25, 30, 48, 50, 60, 120] },
    ],
  },
  {
    cameraId: "arri-alexa-65",
    mediaType: "Codex Compact Drive",
    cardSizes: [1000, 2000],
    usableCapacityMultiplier: 0.96,
    codecs: [
      // ARRIRAW modes (frame sizes from PDF)
      { name: "ARRIRAW 6.5K OG", frameSizeMB: 30.5, supportedFramerates: [24, 25, 30, 48, 50, 60] },
      { name: "ARRIRAW 5.1K", frameSizeMB: 22.1, supportedFramerates: [24, 25, 30, 48, 50, 60] },
      { name: "ARRIRAW 4.5K LF OG", frameSizeMB: 20.9, supportedFramerates: [24, 25, 30, 48, 50, 60] },
      { name: "ARRIRAW 4.3K", frameSizeMB: 18.7, supportedFramerates: [24, 25, 30, 48, 50, 60] },
      { name: "ARRIRAW 4K UHD", frameSizeMB: 12.7, supportedFramerates: [24, 25, 30, 48, 50, 60] },
    ],
  },
  {
    cameraId: "arri-alexa-265",
    mediaType: "Codex Compact Drive",
    cardSizes: [1000, 2000],
    usableCapacityMultiplier: 0.96,
    codecs: [
      // ARRIRAW modes (frame sizes from PDF) - 65mm format
      { name: "ARRIRAW 6.5K OG", frameSizeMB: 30.5, supportedFramerates: [24, 25, 30, 48, 50, 60] },
      { name: "ARRIRAW 5.1K", frameSizeMB: 23.8, supportedFramerates: [24, 25, 30, 48, 50, 60] },
      { name: "ARRIRAW 4.5K LF OG", frameSizeMB: 20.9, supportedFramerates: [24, 25, 30, 43, 48, 50, 60] },
      { name: "ARRIRAW 4.3K", frameSizeMB: 18.7, supportedFramerates: [24, 25, 30, 48, 50, 60] },
      { name: "ARRIRAW 4K UHD", frameSizeMB: 12.7, supportedFramerates: [24, 25, 30, 48, 50, 60] },
    ],
  },

  // --- Sony ---
  {
    cameraId: "sony-venice",
    mediaType: "AXS Memory Card",
    cardSizes: [1000, 2000],
    codecs: [
      { name: "X-OCN XT 6K", frameSizeMB: 12.5, supportedFramerates: [24, 25, 30, 48, 50, 60] },
      { name: "X-OCN ST 6K", frameSizeMB: 8.3, supportedFramerates: [24, 25, 30, 48, 50, 60] },
      { name: "X-OCN LT 6K", frameSizeMB: 4.9, supportedFramerates: [24, 25, 30, 48, 50, 60, 90] },
      { name: "XAVC 4K Class 480", frameSizeMB: 2.5, supportedFramerates: [24, 25, 30, 48, 50, 60] },
      { name: "XAVC 4K Class 300", frameSizeMB: 1.56, supportedFramerates: [24, 25, 30, 48, 50, 60, 120] },
    ],
  },
  {
    cameraId: "sony-venice-2-6k",
    mediaType: "AXS Memory Card",
    cardSizes: [1000, 2000],
    codecs: [
      { name: "X-OCN XT 6K", frameSizeMB: 12.5, supportedFramerates: [24, 25, 30, 48, 50, 60, 90] },
      { name: "X-OCN ST 6K", frameSizeMB: 8.3, supportedFramerates: [24, 25, 30, 48, 50, 60, 90, 120] },
      { name: "X-OCN LT 6K", frameSizeMB: 4.9, supportedFramerates: [24, 25, 30, 48, 50, 60, 90, 120] },
      { name: "XAVC 4K Class 480", frameSizeMB: 2.5, supportedFramerates: [24, 25, 30, 48, 50, 60] },
      { name: "XAVC 4K Class 300", frameSizeMB: 1.56, supportedFramerates: [24, 25, 30, 48, 50, 60, 120] },
    ],
  },
  {
    cameraId: "sony-venice-2",
    mediaType: "AXS Memory Card",
    cardSizes: [1000, 2000],
    codecs: [
      // Full Frame modes (X-OCN XT frame sizes, fps from Sony poster)
      { name: "X-OCN XT 8.6K 3:2", frameSizeMB: 27.84, supportedFramerates: [24, 25, 30] },
      { name: "X-OCN XT 8.6K 17:9", frameSizeMB: 22.0, supportedFramerates: [24, 25, 30, 48] },
      { name: "X-OCN XT 8.2K 17:9", frameSizeMB: 19.8, supportedFramerates: [24, 25, 30, 48, 50, 60] },
      { name: "X-OCN XT 8.2K 2.39:1", frameSizeMB: 15.7, supportedFramerates: [24, 25, 30, 48, 50, 60, 72] },
      { name: "X-OCN XT 8.1K 16:9", frameSizeMB: 20.6, supportedFramerates: [24, 25, 30, 48] },
      { name: "X-OCN XT 7.6K 16:9", frameSizeMB: 18.5, supportedFramerates: [24, 25, 30, 48, 50, 60] },
      // X-OCN ST modes
      { name: "X-OCN ST 8.6K 3:2", frameSizeMB: 19.05, supportedFramerates: [24, 25, 30] },
      { name: "X-OCN ST 8.6K 17:9", frameSizeMB: 15.1, supportedFramerates: [24, 25, 30, 48] },
      { name: "X-OCN ST 8.2K", frameSizeMB: 13.6, supportedFramerates: [24, 25, 30, 48, 50, 60] },
      // X-OCN LT modes
      { name: "X-OCN LT 8.6K 3:2", frameSizeMB: 11.22, supportedFramerates: [24, 25, 30] },
      { name: "X-OCN LT 8.6K 17:9", frameSizeMB: 8.9, supportedFramerates: [24, 25, 30, 48] },
      { name: "X-OCN LT 8.2K", frameSizeMB: 8.0, supportedFramerates: [24, 25, 30, 48, 50, 60] },
      // Super 35 modes
      { name: "X-OCN XT 5.8K 17:9", frameSizeMB: 9.9, supportedFramerates: [24, 25, 30, 48, 50, 60, 72, 75, 90] },
      { name: "X-OCN XT 5.8K 6:5", frameSizeMB: 15.7, supportedFramerates: [24, 25, 30, 48] },
      { name: "X-OCN XT 5.8K 4:3", frameSizeMB: 13.8, supportedFramerates: [24, 25, 30, 48, 50, 60] },
      { name: "X-OCN XT 5.5K 2.39:1", frameSizeMB: 7.0, supportedFramerates: [24, 25, 30, 48, 50, 60, 90, 100, 120] },
      { name: "X-OCN XT 5.4K 16:9", frameSizeMB: 9.3, supportedFramerates: [24, 25, 30, 48, 50, 60, 72, 75, 90] },
    ],
  },
];

export function getCodecProfile(cameraId: string): CameraCodecProfile | undefined {
  return CODEC_DATABASE.find((profile) => profile.cameraId === cameraId);
}

export function getSupportedCameraIds(): string[] {
  return CODEC_DATABASE.map((profile) => profile.cameraId);
}

export function formatCardSize(sizeGB: number): string {
  if (sizeGB >= 1000) {
    return `${sizeGB / 1000}TB`;
  }
  return `${sizeGB}GB`;
}
