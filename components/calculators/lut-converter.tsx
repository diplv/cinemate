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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  convertLutFile,
  downloadFile,
  formatFileSize,
  type ConversionResult,
} from "@/lib/lut-api";
import { Upload, Download, Loader2, X, RotateCcw, AlertCircle } from "lucide-react";

type Status = "idle" | "uploading" | "converting" | "done" | "error";

export function LutConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const name = selected.name.toLowerCase();
    if (!name.endsWith(".aml") && !name.endsWith(".cube")) {
      setError("Please select an .aml or .cube file");
      return;
    }

    if (selected.size > 50 * 1024 * 1024) {
      setError("File must be smaller than 50MB");
      return;
    }

    setFile(selected);
    setError(null);
    setResult(null);
    setStatus("idle");
  };

  const handleRemoveFile = () => {
    setFile(null);
    setError(null);
    setResult(null);
    setStatus("idle");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleConvert = async () => {
    if (!file) return;

    setStatus("uploading");
    setError(null);
    setResult(null);

    try {
      setStatus("converting");
      const conversionResult = await convertLutFile(file);
      setResult(conversionResult);
      setStatus("done");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Conversion failed";
      setError(message);
      setStatus("error");
    }
  };

  const handleDownload = (filename: string) => {
    if (!result) return;
    downloadFile(result.downloadToken, filename);
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setStatus("idle");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const isProcessing = status === "uploading" || status === "converting";

  return (
    <div className="space-y-4">
      {/* File Upload */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">ARRI Look Conversion</CardTitle>
          <CardDescription>
            Convert LogC3 *.aml/*.cube Look to LogC4 *.alf4c for Alexa 35
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>ARRI Look File (.aml or .cube)</Label>
            <div
              className="relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors hover:border-primary/50 cursor-pointer"
              onClick={() => !isProcessing && fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".aml,.cube"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isProcessing}
              />
              {file ? (
                <div className="flex items-center gap-2 w-full">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  {!isProcessing && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile();
                      }}
                      className="rounded-full p-1 hover:bg-accent"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Click to select .aml or .cube file
                  </p>
                </>
              )}
            </div>
          </div>

          <Button
            onClick={handleConvert}
            disabled={!file || isProcessing}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {status === "uploading" ? "Uploading..." : "Converting..."}
              </>
            ) : (
              "Convert"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="border-destructive/50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
              <div className="space-y-1">
                <p className="text-sm text-destructive">{error}</p>
                <Button variant="ghost" size="sm" onClick={handleReset}>
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Try Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {status === "done" && result && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Converted Files</CardTitle>
            <CardDescription>
              Files are available for 5 minutes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* CUBE File */}
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 mr-2">
                <p className="text-sm truncate">{result.files.cube.name}</p>
                <p className="text-xs text-muted-foreground">CUBE (extracted)</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="outline">
                  {formatFileSize(result.files.cube.size)}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownload(result.files.cube.name)}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="h-px bg-border" />

            {/* ALF4c Look File */}
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 mr-2">
                <p className="text-sm truncate">{result.files.lookFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  ARRI Look File ({result.files.lookFile.format})
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="default">
                  {formatFileSize(result.files.lookFile.size)}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownload(result.files.lookFile.name)}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="h-px bg-border" />

            <Button variant="outline" size="sm" onClick={handleReset} className="w-full">
              <RotateCcw className="h-3 w-3 mr-2" />
              Convert Another
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
