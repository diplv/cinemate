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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { calculateDiopter } from "@/lib/diopter-calculations";
import { formatForUnit, feetToMeters } from "@/lib/units";
import { useUnit } from "@/components/unit-provider";

const DIOPTER_PRESETS = [
  { label: "+0.25", value: 0.25 },
  { label: "+0.5", value: 0.5 },
  { label: "+1", value: 1 },
  { label: "+1.5", value: 1.5 },
  { label: "+2", value: 2 },
  { label: "+3", value: 3 },
  { label: "+4", value: 4 },
];

export function DiopterCalculator() {
  const { unit } = useUnit();
  const [diopterStrength, setDiopterStrength] = useState(1);
  const [focusDistance, setFocusDistance] = useState<number | "infinity">(
    "infinity",
  );
  const [focusDistanceInput, setFocusDistanceInput] = useState("INF");
  const [diopterPosition, setDiopterPosition] = useState(0);

  const result = useMemo(() => {
    const fd = focusDistance === "infinity" ? Infinity : focusDistance;
    return calculateDiopter(diopterStrength, fd, diopterPosition);
  }, [diopterStrength, focusDistance, diopterPosition]);

  const fmt = (meters: number) => formatForUnit(meters, unit);
  const distLabel = unit === "metric" ? "meters" : "feet";

  const handleFocusDistanceChange = (val: string) => {
    setFocusDistanceInput(val);
    const upper = val.toUpperCase();
    if (upper === "INF" || upper === "" || upper === "INFINITY") {
      setFocusDistance("infinity");
    } else {
      const num = parseFloat(val);
      if (!isNaN(num) && num > 0) {
        setFocusDistance(unit === "imperial" ? feetToMeters(num) : num);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Inputs */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Diopter Parameters</CardTitle>
          <CardDescription>
            Configure your close-up / split diopter
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Diopter Strength */}
          <div className="space-y-2">
            <Label>Diopter Strength</Label>
            <Select
              value={String(diopterStrength)}
              onValueChange={(v) => setDiopterStrength(parseFloat(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DIOPTER_PRESETS.map((p) => (
                  <SelectItem key={p.value} value={String(p.value)}>
                    {p.label} D
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Close Focus Distance */}
          <div className="space-y-2">
            <Label>Lens Close Focus Distance</Label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={focusDistanceInput}
                onChange={(e) => handleFocusDistanceChange(e.target.value)}
                placeholder={`${distLabel} or INF`}
                className="flex-1"
              />
              <button
                type="button"
                className="rounded-md border px-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                onClick={() => {
                  setFocusDistanceInput("INF");
                  setFocusDistance("infinity");
                }}
              >
                INF
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Lens close focus distance ({distLabel}). Use INF for infinity.
            </p>
          </div>

          {/* Diopter Position from Sensor */}
          <div className="space-y-2">
            <Label>Diopter Position from Sensor (mm)</Label>
            <Slider
              value={[diopterPosition]}
              onValueChange={([v]) => setDiopterPosition(v)}
              min={0}
              max={500}
              step={5}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0 mm</span>
              <span className="font-medium text-foreground">
                {diopterPosition} mm
              </span>
              <span>500 mm</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Distance from sensor plane to the diopter. Shifts working distance
              closer.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Diopter focal length */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Diopter Focal Length
            </span>
            <Badge variant="secondary">
              {isFinite(result.diopterFocalLength)
                ? `${result.diopterFocalLength.toFixed(0)} mm`
                : "---"}
            </Badge>
          </div>

          <div className="h-px bg-border" />

          {/* Close Focus */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Close Focus</span>
            <Badge variant="default">{fmt(result.closeFocus)}</Badge>
          </div>

          {/* Far Focus */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Far Focus</span>
            <Badge variant="outline">{fmt(result.farFocus ?? Infinity)}</Badge>
          </div>

          {/* Focus Range */}
          <div className="h-px bg-border" />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Focus Range</span>
            <span className="text-sm font-medium">
              {fmt(result.closeFocus)} — {fmt(result.farFocus ?? Infinity)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
