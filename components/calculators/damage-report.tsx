"use client";

import { useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  buildDamageReportBlob,
  damageReportFilename,
  type DamageReportData,
  type DamagePhoto,
  type PhotoFileType,
} from "@/lib/damage-report-docx";
import { Upload, Download, Loader2, X, FileWarning } from "lucide-react";

interface PhotoEntry {
  file: File;
  url: string;
  caption: string;
}

const NATIVE_TYPES: Record<string, PhotoFileType> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/bmp": "bmp",
};

const MAX_W = 600;
const MAX_H = 420;

// Read a photo File into bytes + scaled display dimensions for the .docx.
// Common formats pass through as-is; anything the browser can decode but docx
// can't embed (webp/heic/…) is re-encoded to PNG via canvas.
async function prepareImage(file: File): Promise<DamagePhoto> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(MAX_W / bitmap.width, MAX_H / bitmap.height, 1);
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const native = NATIVE_TYPES[file.type];
  if (native) {
    const data = await file.arrayBuffer();
    bitmap.close();
    return { data, width, height, caption: "", type: native };
  }

  // Re-encode unsupported formats to PNG at natural size.
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not available for image conversion");
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  const blob: Blob = await new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("PNG conversion failed"))), "image/png"),
  );
  return { data: await blob.arrayBuffer(), width, height, caption: "", type: "png" };
}

export function DamageReport() {
  const [data, setData] = useState({
    name: "",
    department: "",
    position: "",
    dateOfDamage: "",
    policeRef: "",
    lost: false,
    damaged: true,
    manner: "",
    location: "",
    itemsDescription: "",
    damageDescription: "",
    replacementValue: "",
    repairable: "",
    repairEstimate: "",
    vendorName: "",
    vendorAddress: "",
    vendorContact: "",
    vendorPo: "",
  });
  const [photos, setPhotos] = useState<PhotoEntry[]>([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof typeof data>(key: K, value: (typeof data)[K]) =>
    setData((d) => ({ ...d, [key]: value }));

  const handlePhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).filter((f) => f.type.startsWith("image/"));
    setPhotos((prev) => [
      ...prev,
      ...files.map((file) => ({ file, url: URL.createObjectURL(file), caption: "" })),
    ]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removePhoto = (i: number) => {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[i]?.url ?? "");
      return prev.filter((_, idx) => idx !== i);
    });
  };

  const setCaption = (i: number, caption: string) =>
    setPhotos((prev) => prev.map((p, idx) => (idx === i ? { ...p, caption } : p)));

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const prepared: DamagePhoto[] = [];
      for (const p of photos) {
        const img = await prepareImage(p.file);
        prepared.push({ ...img, caption: p.caption });
      }
      const payload: DamageReportData = { ...data, photos: prepared };
      const blob = await buildDamageReportBlob(payload);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = damageReportFilename(data.name, data.dateOfDamage);
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate the document");
    } finally {
      setGenerating(false);
    }
  };

  const field = (
    label: string,
    key: keyof typeof data,
    opts: { textarea?: boolean; type?: string; placeholder?: string } = {},
  ) => (
    <div className="space-y-1.5">
      <Label htmlFor={key}>{label}</Label>
      {opts.textarea ? (
        <textarea
          id={key}
          value={data[key] as string}
          onChange={(e) => set(key, e.target.value)}
          placeholder={opts.placeholder}
          className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm min-h-[72px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      ) : (
        <Input
          id={key}
          type={opts.type ?? "text"}
          value={data[key] as string}
          onChange={(e) => set(key, e.target.value)}
          placeholder={opts.placeholder}
        />
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileWarning className="h-4 w-4" /> Loss &amp; Damage Report
          </CardTitle>
          <CardDescription>
            Fill in the report, attach photos, and download an editable .docx.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {field("Name", "name")}
          {field("Department", "department")}
          {field("Position", "position")}
          {field("Date of Loss/Damage", "dateOfDamage", { type: "date" })}
          {field("Police Crime Reference # (if over £500)", "policeRef")}
          <div className="flex items-center gap-6 pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <Checkbox checked={data.lost} onCheckedChange={(v) => set("lost", v === true)} />
              Lost Property
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <Checkbox checked={data.damaged} onCheckedChange={(v) => set("damaged", v === true)} />
              Damaged
            </label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Incident</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {field("Manner in which loss and/or damage occurred", "manner", { textarea: true })}
          {field("Location of loss and/or damage", "location")}
          {field(
            "Description of lost or damaged item(s) — brand / serial no.",
            "itemsDescription",
            { textarea: true },
          )}
          {field("Description of damage", "damageDescription", { textarea: true })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Damage photos</CardTitle>
          <CardDescription>Added right after the damage description in the report.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div
            className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors hover:border-primary/50 cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotos}
              className="hidden"
            />
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Click to add photos</p>
          </div>
          {photos.length > 0 && (
            <div className="space-y-3">
              {photos.map((p, i) => (
                <div key={p.url} className="flex items-start gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.url}
                    alt={`Photo ${i + 1}`}
                    className="h-16 w-16 rounded object-cover shrink-0 border"
                  />
                  <div className="flex-1 min-w-0">
                    <Input
                      value={p.caption}
                      onChange={(e) => setCaption(i, e.target.value)}
                      placeholder={`Photo ${i + 1} caption (optional)`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="rounded-full p-1 hover:bg-accent shrink-0"
                    aria-label="Remove photo"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Valuation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {field("Approximate Replacement Value", "replacementValue")}
          {field("Is the item(s) repairable?", "repairable")}
          {field("Repair Estimate (if applicable)", "repairEstimate")}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">If rented — Vendor information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {field("Name", "vendorName")}
          {field("Address", "vendorAddress")}
          {field("Phone number and/or email", "vendorContact")}
          {field("PO # (if applicable)", "vendorPo")}
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive/50">
          <CardContent className="pt-4">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      <Button onClick={handleGenerate} disabled={generating} className="w-full">
        {generating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" /> Generating…
          </>
        ) : (
          <>
            <Download className="h-4 w-4 mr-2" /> Generate .docx
          </>
        )}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        The report is built on your device — photos are never uploaded.
      </p>
    </div>
  );
}
