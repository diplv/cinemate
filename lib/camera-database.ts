export interface SensorMode {
  name: string;
  width: number;  // mm
  height: number; // mm
  anamorphicSqueeze?: number;
}

export interface Camera {
  id: string;
  manufacturer: string;
  model: string;
  sensorModes: SensorMode[];
}

export const CAMERA_DATABASE: Camera[] = [
  // --- ARRI ---
  {
    id: "arri-alexa-35",
    manufacturer: "ARRI",
    model: "Alexa 35",
    sensorModes: [
      { name: "4.6K 3:2 Open Gate", width: 28.0, height: 19.2 },
      { name: "4.6K 16:9", width: 28.0, height: 15.7 },
      { name: "4K 16:9", width: 24.9, height: 14.0 },
      { name: "4K 2:1", width: 24.9, height: 12.4 },
      { name: "3.8K 16:9", width: 23.3, height: 13.1 },
      { name: "3.3K 6:5", width: 20.22, height: 16.95 },
      { name: "3K 1:1", width: 18.7, height: 18.7 },
      { name: "2.7K 8:9", width: 16.7, height: 18.7 },
      { name: "2K 16:9 S16", width: 12.4, height: 7.0 },
    ],
  },
  {
    id: "arri-mini-lf",
    manufacturer: "ARRI",
    model: "ALEXA Mini LF",
    sensorModes: [
      { name: "4.5K LF 3:2 Open Gate", width: 36.70, height: 25.54 },
      { name: "4.5K LF 2.39:1", width: 36.70, height: 15.31 },
      { name: "4.3K LF 16:9", width: 35.64, height: 20.05 },
      { name: "3.8K LF 16:9", width: 31.68, height: 17.82 },
      { name: "2.8K LF 1:1", width: 23.76, height: 23.76 },
      { name: "3.4K S35 3:2", width: 28.25, height: 18.16 },
      { name: "3.2K S35 16:9", width: 26.40, height: 14.85 },
      { name: "2.8K S35 4:3", width: 23.76, height: 17.81 },
      { name: "2.8K S35 16:9", width: 23.76, height: 13.36 },
    ],
  },
  {
    id: "arri-alexa-mini",
    manufacturer: "ARRI",
    model: "ALEXA Mini",
    sensorModes: [
      { name: "Open Gate 3.4K", width: 28.25, height: 18.17 },
      { name: "3.2K 16:9", width: 26.40, height: 14.85 },
      { name: "4K UHD 16:9", width: 26.40, height: 14.85 },
      { name: "ARRIRAW 16:9 2.8K", width: 23.76, height: 13.37 },
      { name: "HD 16:9", width: 23.76, height: 13.37 },
      { name: "2K 16:9", width: 23.66, height: 13.30 },
      { name: "4:3 2.8K", width: 23.76, height: 17.82 },
      { name: "2.39:1 2K Ana", width: 21.12, height: 17.70 },
      { name: "HD Ana", width: 15.84, height: 17.82 },
      { name: "S16 HD", width: 13.20, height: 7.43 },
    ],
  },
  {
    id: "arri-alexa-65",
    manufacturer: "ARRI",
    model: "ALEXA 65",
    sensorModes: [
      { name: "Open Gate (6.5K)", width: 54.12, height: 25.58 },
      { name: "5.1K", width: 42.24, height: 25.58 },
      { name: "LF Open Gate 4.5K", width: 36.70, height: 25.54 },
      { name: "4.3K", width: 35.64, height: 23.76 },
      { name: "4K UHD", width: 31.68, height: 17.82 },
    ],
  },
  {
    id: "arri-alexa-35-xtreme",
    manufacturer: "ARRI",
    model: "ALEXA 35 Xtreme",
    sensorModes: [
      { name: "4.6K 3:2 Open Gate", width: 27.99, height: 19.22 },
      { name: "4.6K 16:9", width: 27.99, height: 15.75 },
      { name: "4K 16:9", width: 24.88, height: 14.00 },
      { name: "3.8K 16:9 UHD", width: 23.33, height: 13.12 },
      { name: "3.8K 2.39:1", width: 23.33, height: 9.77 },
      { name: "3.3K 6:5", width: 20.22, height: 16.95 },
      { name: "2K S16", width: 12.44, height: 7.00 },
      { name: "HD S16", width: 11.66, height: 6.56 },
    ],
  },
  {
    id: "arri-alexa-265",
    manufacturer: "ARRI",
    model: "ALEXA 265",
    sensorModes: [
      { name: "Open Gate 6.5K", width: 54.12, height: 25.58 },
      { name: "5.1K", width: 42.24, height: 23.76 },
      { name: "LF Open Gate 4.5K", width: 36.70, height: 25.54 },
      { name: "4.3K", width: 35.64, height: 23.76 },
      { name: "4K UHD", width: 31.68, height: 17.82 },
    ],
  },

  // --- Sony ---
  {
    id: "sony-venice",
    manufacturer: "Sony",
    model: "VENICE",
    sensorModes: [
      { name: "6K 3:2", width: 35.9, height: 24.0 },
      { name: "6K 17:9", width: 36.0, height: 19.0 },
      { name: "6K 1.85:1", width: 36.0, height: 19.4 },
      { name: "6K 2.39:1", width: 35.9, height: 15.0 },
      { name: "5.7K 16:9", width: 33.7, height: 18.9 },
      { name: "4K 4:3", width: 24.3, height: 18.0 },
      { name: "4K 4:3 Surround View", width: 27.0, height: 20.0 },
      { name: "4K 6:5", width: 24.3, height: 20.4 },
      { name: "4K 17:9", width: 24.3, height: 12.8 },
      { name: "4K 2.39:1", width: 24.3, height: 10.3 },
      { name: "3.8K 16:9", width: 22.8, height: 12.8 },
    ],
  },
  {
    id: "sony-venice-2-6k",
    manufacturer: "Sony",
    model: "VENICE 2 6K",
    sensorModes: [
      { name: "6K 3:2", width: 35.9, height: 24.0 },
      { name: "6K 1.85:1", width: 36.0, height: 19.4 },
      { name: "6K 17:9", width: 36.0, height: 19.0 },
      { name: "6K 2.39:1", width: 35.9, height: 15.1 },
      { name: "5.7K 16:9", width: 33.7, height: 18.9 },
      { name: "4K 6:5", width: 24.3, height: 20.4 },
      { name: "4K 4:3", width: 24.3, height: 18.0 },
      { name: "4K 4:3 Surround View", width: 27.0, height: 20.0 },
      { name: "4K 17:9", width: 24.3, height: 12.8 },
      { name: "4K 17:9 Surround View", width: 27.0, height: 14.3 },
      { name: "4K 2.39:1", width: 24.3, height: 10.3 },
      { name: "3.8K 16:9", width: 22.8, height: 12.8 },
      { name: "3.8K 16:9 Surround View", width: 25.4, height: 14.3 },
    ],
  },
  {
    id: "sony-venice-2",
    manufacturer: "Sony",
    model: "VENICE 2 8K",
    sensorModes: [
      { name: "8.6K 3:2", width: 35.9, height: 24.0 },
      { name: "8.6K 17:9", width: 35.9, height: 19.0 },
      { name: "8.2K 2.39:1", width: 34.1, height: 14.3 },
      { name: "8.2K 17:9", width: 34.1, height: 18.0 },
      { name: "8.1K 16:9", width: 33.7, height: 19.0 },
      { name: "7.6K 16:9", width: 31.9, height: 18.0 },
      { name: "5.8K 6:5", width: 24.1, height: 20.2 },
      { name: "5.8K 4:3", width: 24.1, height: 17.8 },
      { name: "5.8K 17:9", width: 24.1, height: 12.7 },
      { name: "5.5K 2.39:1", width: 22.8, height: 9.6 },
      { name: "5.4K 16:9", width: 22.6, height: 12.7 },
    ],
  },
  {
    id: "sony-burano",
    manufacturer: "Sony",
    model: "Burano",
    sensorModes: [
      { name: "Full Frame (8.2K)", width: 36.20, height: 24.10 },
      { name: "Full Frame 16:9", width: 36.20, height: 20.36 },
      { name: "Super 35 (4K)", width: 24.90, height: 14.00 },
    ],
  },

  // --- RED ---
  {
    id: "red-v-raptor",
    manufacturer: "RED",
    model: "V-Raptor XL",
    sensorModes: [
      { name: "Full Frame (8K)", width: 40.96, height: 21.60 },
      { name: "Full Frame 16:9 (6K)", width: 30.72, height: 17.28 },
      { name: "Super 35 (4K)", width: 25.60, height: 13.50 },
    ],
  },
  {
    id: "red-komodo",
    manufacturer: "RED",
    model: "KOMODO 6K",
    sensorModes: [
      { name: "Super 35 (6K)", width: 27.03, height: 14.26 },
      { name: "16:9 (4K)", width: 22.53, height: 12.67 },
    ],
  },
  {
    id: "red-monstro",
    manufacturer: "RED",
    model: "Monstro 8K VV",
    sensorModes: [
      { name: "Full Frame (8K)", width: 40.96, height: 21.60 },
      { name: "16:9 (6K)", width: 30.72, height: 17.28 },
    ],
  },

  // --- Blackmagic ---
  {
    id: "bmd-ursa-mini-12k",
    manufacturer: "Blackmagic",
    model: "URSA Mini Pro 12K",
    sensorModes: [
      { name: "Super 35 (12K)", width: 27.03, height: 14.26 },
      { name: "16:9 (8K)", width: 27.03, height: 15.20 },
    ],
  },
  {
    id: "bmd-pocket-6k",
    manufacturer: "Blackmagic",
    model: "Pocket Cinema 6K",
    sensorModes: [
      { name: "Super 35 (6K)", width: 23.10, height: 12.99 },
      { name: "16:9 (4K)", width: 20.48, height: 11.52 },
    ],
  },
  {
    id: "bmd-pyxis-6k",
    manufacturer: "Blackmagic",
    model: "PYXIS 6K",
    sensorModes: [
      { name: "Full Frame (6K)", width: 36.00, height: 24.00 },
      { name: "16:9", width: 36.00, height: 20.25 },
    ],
  },

  // --- Canon ---
  {
    id: "canon-c500-ii",
    manufacturer: "Canon",
    model: "C500 Mark II",
    sensorModes: [
      { name: "Full Frame (5.9K)", width: 38.10, height: 20.10 },
      { name: "Super 35 (4K)", width: 26.20, height: 13.80 },
      { name: "Super 16 (2K)", width: 14.87, height: 8.36 },
    ],
  },
  {
    id: "canon-c70",
    manufacturer: "Canon",
    model: "C70",
    sensorModes: [
      { name: "Super 35 (4K)", width: 25.10, height: 13.30 },
      { name: "Super 16 Crop", width: 14.87, height: 8.36 },
    ],
  },
];

export function getCamerasByManufacturer(): Record<string, Camera[]> {
  const grouped: Record<string, Camera[]> = {};
  for (const camera of CAMERA_DATABASE) {
    if (!grouped[camera.manufacturer]) {
      grouped[camera.manufacturer] = [];
    }
    grouped[camera.manufacturer].push(camera);
  }
  return grouped;
}

export function findCamera(id: string): Camera | undefined {
  return CAMERA_DATABASE.find((c) => c.id === id);
}
