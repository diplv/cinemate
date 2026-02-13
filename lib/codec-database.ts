export interface Codec {
  name: string;
  dataRateMbps: number;
  supportedFramerates: number[];
}

export interface CameraCodecProfile {
  cameraId: string;
  mediaType: string;
  cardSizes: number[]; // in GB
  codecs: Codec[];
}

export const CODEC_DATABASE: CameraCodecProfile[] = [
  // --- ARRI ---
  {
    cameraId: "arri-alexa-35",
    mediaType: "CFexpress Type B",
    cardSizes: [1000, 2000],
    codecs: [
      { name: "ARRIRAW 4.6K", dataRateMbps: 2780, supportedFramerates: [24, 25, 30, 48, 50, 60] },
      { name: "ARRIRAW 4K", dataRateMbps: 2160, supportedFramerates: [24, 25, 30, 48, 50, 60, 75] },
      { name: "ARRIRAW 3.3K 6:5", dataRateMbps: 2160, supportedFramerates: [24, 25, 30, 48, 50, 60] },
      { name: "ProRes 4444 XQ", dataRateMbps: 660, supportedFramerates: [24, 25, 30, 48, 50, 60, 90, 120] },
      { name: "ProRes 4444", dataRateMbps: 440, supportedFramerates: [24, 25, 30, 48, 50, 60, 90, 120] },
      { name: "ProRes 422 HQ", dataRateMbps: 220, supportedFramerates: [24, 25, 30, 48, 50, 60, 90, 120] },
      { name: "ProRes 422", dataRateMbps: 147, supportedFramerates: [24, 25, 30, 48, 50, 60, 90, 120] },
    ],
  },
  {
    cameraId: "arri-mini-lf",
    mediaType: "CFast 2.0 / SXR Capture Drive",
    cardSizes: [1000, 2000],
    codecs: [
      { name: "ARRIRAW 4.5K LF", dataRateMbps: 2880, supportedFramerates: [24, 25, 30, 48, 50, 60] },
      { name: "ARRIRAW 4.5K LF HDE", dataRateMbps: 1800, supportedFramerates: [24, 25, 30, 48, 50, 60] },
      { name: "ProRes 4444 XQ", dataRateMbps: 660, supportedFramerates: [24, 25, 30, 48, 50, 60, 90] },
      { name: "ProRes 4444", dataRateMbps: 440, supportedFramerates: [24, 25, 30, 48, 50, 60, 90] },
      { name: "ProRes 422 HQ", dataRateMbps: 220, supportedFramerates: [24, 25, 30, 48, 50, 60, 90, 120] },
      { name: "ProRes 422", dataRateMbps: 147, supportedFramerates: [24, 25, 30, 48, 50, 60, 90, 120] },
    ],
  },
  {
    cameraId: "arri-alexa-mini",
    mediaType: "CFast 2.0",
    cardSizes: [128, 256, 512],
    codecs: [
      { name: "ARRIRAW 3.4K", dataRateMbps: 1920, supportedFramerates: [24, 25, 30, 48, 50, 60] },
      { name: "ProRes 4444 XQ", dataRateMbps: 500, supportedFramerates: [24, 25, 30, 48, 50, 60] },
      { name: "ProRes 4444", dataRateMbps: 330, supportedFramerates: [24, 25, 30, 48, 50, 60, 120] },
      { name: "ProRes 422 HQ", dataRateMbps: 220, supportedFramerates: [24, 25, 30, 48, 50, 60, 120, 200] },
      { name: "ProRes 422", dataRateMbps: 147, supportedFramerates: [24, 25, 30, 48, 50, 60, 120, 200] },
    ],
  },

  // --- Sony ---
  {
    cameraId: "sony-venice",
    mediaType: "AXS Memory Card",
    cardSizes: [1000, 2000],
    codecs: [
      { name: "X-OCN XT 6K", dataRateMbps: 2400, supportedFramerates: [24, 25, 30, 48, 50, 60] },
      { name: "X-OCN ST 6K", dataRateMbps: 1600, supportedFramerates: [24, 25, 30, 48, 50, 60] },
      { name: "X-OCN LT 6K", dataRateMbps: 940, supportedFramerates: [24, 25, 30, 48, 50, 60, 90] },
      { name: "XAVC 4K Class 480", dataRateMbps: 480, supportedFramerates: [24, 25, 30, 48, 50, 60] },
      { name: "XAVC 4K Class 300", dataRateMbps: 300, supportedFramerates: [24, 25, 30, 48, 50, 60, 120] },
    ],
  },
  {
    cameraId: "sony-venice-2-6k",
    mediaType: "AXS Memory Card",
    cardSizes: [1000, 2000],
    codecs: [
      { name: "X-OCN XT 6K", dataRateMbps: 2400, supportedFramerates: [24, 25, 30, 48, 50, 60, 90] },
      { name: "X-OCN ST 6K", dataRateMbps: 1600, supportedFramerates: [24, 25, 30, 48, 50, 60, 90, 120] },
      { name: "X-OCN LT 6K", dataRateMbps: 940, supportedFramerates: [24, 25, 30, 48, 50, 60, 90, 120] },
      { name: "XAVC 4K Class 480", dataRateMbps: 480, supportedFramerates: [24, 25, 30, 48, 50, 60] },
      { name: "XAVC 4K Class 300", dataRateMbps: 300, supportedFramerates: [24, 25, 30, 48, 50, 60, 120] },
    ],
  },
  {
    cameraId: "sony-venice-2",
    mediaType: "AXS Memory Card",
    cardSizes: [1000, 2000],
    codecs: [
      { name: "X-OCN XT 8.6K", dataRateMbps: 4800, supportedFramerates: [24, 25, 30] },
      { name: "X-OCN ST 8.6K", dataRateMbps: 3200, supportedFramerates: [24, 25, 30, 48, 50, 60] },
      { name: "X-OCN LT 8.6K", dataRateMbps: 1880, supportedFramerates: [24, 25, 30, 48, 50, 60, 90] },
      { name: "X-OCN XT 6K", dataRateMbps: 2400, supportedFramerates: [24, 25, 30, 48, 50, 60, 90, 120] },
      { name: "X-OCN ST 6K", dataRateMbps: 1600, supportedFramerates: [24, 25, 30, 48, 50, 60, 90, 120] },
      { name: "XAVC 4K Class 480", dataRateMbps: 480, supportedFramerates: [24, 25, 30, 48, 50, 60] },
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
