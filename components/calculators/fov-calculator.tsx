"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  getCamerasByManufacturer,
  findCamera,
  type Camera,
  type SensorMode,
} from "@/lib/camera-database";
import { calculateFullFoV } from "@/lib/fov-calculations";
import { formatForUnit, feetToMeters } from "@/lib/units";
import { useUnit } from "@/components/unit-provider";

const FOCAL_LENGTH_PRESETS = [14, 18, 24, 35, 50, 75, 85, 100, 135, 200];

export function FoVCalculator() {
  const { unit } = useUnit();
  const camerasByMfr = useMemo(() => getCamerasByManufacturer(), []);

  const [cameraId, setCameraId] = useState("arri-alexa-35");
  const [sensorModeName, setSensorModeName] = useState("Open Gate (4.6K)");
  const [focalLength, setFocalLength] = useState(50);
  const [distanceInput, setDistanceInput] = useState<number | "">("");

  // Always store internal distance in meters
  const distanceMeters = useMemo(() => {
    if (distanceInput === "" || distanceInput <= 0) return undefined;
    return unit === "imperial" ? feetToMeters(distanceInput) : distanceInput;
  }, [distanceInput, unit]);

  const camera = useMemo(() => findCamera(cameraId), [cameraId]);

  const sensorMode = useMemo(() => {
    if (!camera) return null;
    return (
      camera.sensorModes.find((m) => m.name === sensorModeName) ??
      camera.sensorModes[0]
    );
  }, [camera, sensorModeName]);

  const result = useMemo(() => {
    if (!sensorMode) return null;
    return calculateFullFoV(
      sensorMode.width,
      sensorMode.height,
      focalLength,
      sensorMode.anamorphicSqueeze ?? 1.0,
      distanceMeters,
    );
  }, [sensorMode, focalLength, distanceMeters]);

  const handleCameraChange = (id: string) => {
    setCameraId(id);
    const newCam = findCamera(id);
    if (newCam && newCam.sensorModes.length > 0) {
      setSensorModeName(newCam.sensorModes[0].name);
    }
  };

  const sensorFormat = useMemo(() => {
    if (!sensorMode) return "";
    const diag = Math.sqrt(
      sensorMode.width ** 2 + sensorMode.height ** 2,
    );
    if (diag > 50) return "Large Format";
    if (diag > 40) return "Full Frame+";
    if (diag > 30) return "Full Frame";
    if (diag > 20) return "Super 35";
    if (diag > 14) return "Super 16";
    return "Sub-16";
  }, [sensorMode]);

  const fmt = (meters: number) => formatForUnit(meters, unit);
  const distLabel = unit === "metric" ? "meters" : "feet";

  return (
    <div className="space-y-4">
      {/* Inputs */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Camera & Lens</CardTitle>
          <CardDescription>Select camera, sensor mode, and lens</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Camera Selection */}
          <div className="space-y-2">
            <Label>Camera</Label>
            <Select value={cameraId} onValueChange={handleCameraChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(camerasByMfr).map(([mfr, cameras]) => (
                  <SelectGroup key={mfr}>
                    <SelectLabel>{mfr}</SelectLabel>
                    {cameras.map((cam: Camera) => (
                      <SelectItem key={cam.id} value={cam.id}>
                        {cam.model}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sensor Mode */}
          {camera && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>Sensor Mode</Label>
                {sensorFormat && (
                  <Badge variant="outline" className="text-xs">
                    {sensorFormat}
                  </Badge>
                )}
              </div>
              <Select
                value={sensorModeName}
                onValueChange={setSensorModeName}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {camera.sensorModes.map((mode: SensorMode) => (
                    <SelectItem key={mode.name} value={mode.name}>
                      {mode.name}
                      {mode.anamorphicSqueeze
                        ? ` (${mode.anamorphicSqueeze}x)`
                        : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {sensorMode && (
                <p className="text-xs text-muted-foreground">
                  Sensor: {sensorMode.width.toFixed(2)} x{" "}
                  {sensorMode.height.toFixed(2)} mm
                </p>
              )}
            </div>
          )}

          {/* Focal Length */}
          <div className="space-y-2">
            <Label>Focal Length (mm)</Label>
            <Input
              type="number"
              value={focalLength}
              onChange={(e) =>
                setFocalLength(Math.max(1, parseInt(e.target.value) || 1))
              }
              min={1}
            />
            <div className="flex flex-wrap gap-1">
              {FOCAL_LENGTH_PRESETS.map((fl) => (
                <button
                  key={fl}
                  type="button"
                  onClick={() => setFocalLength(fl)}
                  className={`rounded-md border px-2 py-0.5 text-xs transition-colors ${
                    focalLength === fl
                      ? "border-primary bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  {fl}
                </button>
              ))}
            </div>
          </div>

          {/* Subject Distance (optional) */}
          <div className="space-y-2">
            <Label>Subject Distance (optional)</Label>
            <Input
              type="number"
              value={distanceInput}
              onChange={(e) => {
                const v = e.target.value;
                setDistanceInput(
                  v === "" ? "" : Math.max(0.1, parseFloat(v) || 0.1),
                );
              }}
              placeholder={distLabel}
              min={0.1}
              step={0.1}
            />
            <p className="text-xs text-muted-foreground">
              Enter distance ({distLabel}) to see field dimensions at that point.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Field of View</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Horizontal</span>
              <Badge variant="default">{result.horizontalDeg.toFixed(1)}°</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Vertical</span>
              <Badge variant="outline">{result.verticalDeg.toFixed(1)}°</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Diagonal</span>
              <Badge variant="outline">{result.diagonalDeg.toFixed(1)}°</Badge>
            </div>

            <div className="h-px bg-border" />

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                FF Equivalent
              </span>
              <Badge variant="secondary">
                {result.ffEquivalent.toFixed(0)} mm
              </Badge>
            </div>

            {sensorMode?.anamorphicSqueeze && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Anamorphic Squeeze
                </span>
                <Badge variant="secondary">
                  {sensorMode.anamorphicSqueeze}x
                </Badge>
              </div>
            )}

            {result.fieldWidthAtDistance !== null &&
              result.fieldHeightAtDistance !== null && (
                <>
                  <div className="h-px bg-border" />
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Field Size at{" "}
                    {typeof distanceInput === "number" ? distanceInput : 0}{" "}
                    {unit === "metric" ? "m" : "ft"}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Width</span>
                    <span className="text-sm">
                      {fmt(result.fieldWidthAtDistance)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Height</span>
                    <span className="text-sm">
                      {fmt(result.fieldHeightAtDistance)}
                    </span>
                  </div>
                </>
              )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
