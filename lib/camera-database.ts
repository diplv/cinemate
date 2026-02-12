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
      { name: "Open Gate (4.5K)", width: 36.70, height: 25.54 },
      { name: "LF 16:9 (4.5K)", width: 36.70, height: 20.64 },
      { name: "LF 2.39:1", width: 36.70, height: 15.31 },
    ],
  },
  {
    id: "arri-alexa-65",
    manufacturer: "ARRI",
    model: "ALEXA 65",
    sensorModes: [
      { name: "Open Gate (6.5K)", width: 54.12, height: 25.58 },
      { name: "LF Open Gate", width: 36.70, height: 25.58 },
      { name: "16:9", width: 54.12, height: 30.46 },
    ],
  },

  // --- Sony ---
  {
    id: "sony-venice-2",
    manufacturer: "Sony",
    model: "VENICE 2",
    sensorModes: [
      { name: "Full Frame (8.6K)", width: 36.20, height: 24.10 },
      { name: "Full Frame 16:9", width: 36.20, height: 20.36 },
      { name: "Super 35 (4K)", width: 24.90, height: 14.00 },
      { name: "Ana 1.8x FF", width: 36.20, height: 24.10, anamorphicSqueeze: 1.8 },
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
