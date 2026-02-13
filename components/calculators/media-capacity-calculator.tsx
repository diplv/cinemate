"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
} from "@/lib/camera-database";
import {
  getCodecProfile,
  getSupportedCameraIds,
  formatCardSize,
  type Codec,
} from "@/lib/codec-database";
import { calculateMediaCapacity } from "@/lib/media-calculations";

export function MediaCapacityCalculator() {
  const supportedCameraIds = useMemo(() => getSupportedCameraIds(), []);
  
  const camerasByMfr = useMemo(() => {
    const allCameras = getCamerasByManufacturer();
    const filtered: Record<string, Camera[]> = {};
    
    for (const [mfr, cameras] of Object.entries(allCameras)) {
      const supported = cameras.filter((cam) => supportedCameraIds.includes(cam.id));
      if (supported.length > 0) {
        filtered[mfr] = supported;
      }
    }
    return filtered;
  }, [supportedCameraIds]);

  const [cameraId, setCameraId] = useState("arri-alexa-35");
  const [codecName, setCodecName] = useState<string>("");
  const [framerate, setFramerate] = useState<number>(24);
  const [cardSize, setCardSize] = useState<number>(1000);

  const camera = useMemo(() => findCamera(cameraId), [cameraId]);
  const codecProfile = useMemo(() => getCodecProfile(cameraId), [cameraId]);

  const selectedCodec = useMemo(() => {
    if (!codecProfile) return null;
    return codecProfile.codecs.find((c) => c.name === codecName) ?? codecProfile.codecs[0];
  }, [codecProfile, codecName]);

  const availableFramerates = useMemo(() => {
    if (!selectedCodec) return [24];
    return selectedCodec.supportedFramerates;
  }, [selectedCodec]);

  // Handle camera change - reset codec, card size
  const handleCameraChange = (id: string) => {
    setCameraId(id);
    const profile = getCodecProfile(id);
    if (profile) {
      setCodecName(profile.codecs[0]?.name ?? "");
      setCardSize(profile.cardSizes[0] ?? 1000);
      const firstCodec = profile.codecs[0];
      if (firstCodec) {
        setFramerate(firstCodec.supportedFramerates.includes(24) ? 24 : firstCodec.supportedFramerates[0]);
      }
    }
  };

  // Handle codec change - reset framerate if needed
  const handleCodecChange = (name: string) => {
    setCodecName(name);
    const codec = codecProfile?.codecs.find((c) => c.name === name);
    if (codec && !codec.supportedFramerates.includes(framerate)) {
      setFramerate(codec.supportedFramerates.includes(24) ? 24 : codec.supportedFramerates[0]);
    }
  };

  // Initialize codec on first render
  useMemo(() => {
    if (codecProfile && !codecName) {
      setCodecName(codecProfile.codecs[0]?.name ?? "");
    }
  }, [codecProfile, codecName]);

  const result = useMemo(() => {
    if (!selectedCodec) return null;
    return calculateMediaCapacity(cardSize, selectedCodec.frameSizeMB, framerate);
  }, [selectedCodec, cardSize, framerate]);

  return (
    <div className="space-y-4">
      {/* Inputs */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Recording Setup</CardTitle>
          <CardDescription>Select camera, codec, framerate, and media</CardDescription>
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
            {codecProfile && (
              <p className="text-xs text-muted-foreground">
                Media: {codecProfile.mediaType}
              </p>
            )}
          </div>

          {/* Codec Selection */}
          {codecProfile && (
            <div className="space-y-2">
              <Label>Codec</Label>
              <Select value={codecName} onValueChange={handleCodecChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {codecProfile.codecs.map((codec: Codec) => (
                    <SelectItem key={codec.name} value={codec.name}>
                      {codec.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedCodec && (
                <p className="text-xs text-muted-foreground">
                  Frame size: {selectedCodec.frameSizeMB} MB
                </p>
              )}
            </div>
          )}

          {/* Framerate Selection */}
          <div className="space-y-2">
            <Label>Framerate (fps)</Label>
            <div className="flex flex-wrap gap-1">
              {availableFramerates.map((fps) => (
                <button
                  key={fps}
                  type="button"
                  onClick={() => setFramerate(fps)}
                  className={`rounded-md border px-2 py-0.5 text-xs transition-colors ${
                    framerate === fps
                      ? "border-primary bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  {fps}
                </button>
              ))}
            </div>
          </div>

          {/* Card Size Selection */}
          {codecProfile && (
            <div className="space-y-2">
              <Label>Card Capacity</Label>
              <div className="flex flex-wrap gap-1">
                {codecProfile.cardSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setCardSize(size)}
                    className={`rounded-md border px-3 py-1 text-xs transition-colors ${
                      cardSize === size
                        ? "border-primary bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    {formatCardSize(size)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {result && selectedCodec && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recording Capacity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Recording Time</span>
              <Badge variant="default" className="text-lg px-3 py-1">
                {result.formatted}
              </Badge>
            </div>

            <div className="h-px bg-border" />

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Frame Size</span>
              <Badge variant="secondary">{selectedCodec.frameSizeMB} MB</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Card Capacity</span>
              <Badge variant="outline">{formatCardSize(cardSize)}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Framerate</span>
              <Badge variant="outline">{framerate} fps</Badge>
            </div>

            {result.totalSeconds > 0 && (
              <>
                <div className="h-px bg-border" />
                <p className="text-xs text-muted-foreground">
                  {result.hours > 0 && `${result.hours} hours `}
                  {result.minutes > 0 && `${result.minutes} minutes `}
                  {result.seconds > 0 && `${result.seconds} seconds`}
                  {" "}of footage at {framerate}fps
                </p>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
