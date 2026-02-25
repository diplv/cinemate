const API_URL = process.env.NEXT_PUBLIC_LUT_API_URL || "http://localhost:8080";

export interface ConversionFileInfo {
  name: string;
  size: number;
}

export interface LookFileInfo {
  name: string;
  size: number;
  format: string;
}

export interface ConversionResult {
  success: true;
  files: {
    cube: ConversionFileInfo;
    lookFile: LookFileInfo;
  };
  downloadToken: string;
}

export interface ConversionError {
  success: false;
  error: string;
  code: string;
}

export type ConversionResponse = ConversionResult | ConversionError;

export async function convertLutFile(file: File): Promise<ConversionResult> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/api/convert`, {
    method: "POST",
    body: formData,
  });

  const data: ConversionResponse = await response.json();

  if (!data.success) {
    throw new Error(data.error || "Conversion failed");
  }

  return data;
}

export function getDownloadUrl(token: string, filename: string): string {
  return `${API_URL}/api/download/${token}/${encodeURIComponent(filename)}`;
}

export async function downloadFile(token: string, filename: string): Promise<void> {
  const url = getDownloadUrl(token, filename);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
