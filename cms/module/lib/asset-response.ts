import { Buffer } from "node:buffer";

export function contentTypeForAssetFilename(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".css")) return "text/css; charset=utf-8";
  if (lower.endsWith(".js")) return "application/javascript; charset=utf-8";
  if (lower.endsWith(".svg")) return "image/svg+xml; charset=utf-8";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".ico")) return "image/x-icon";
  return "application/octet-stream";
}

export function decodeDataUrlBody(
  body: string,
): { bytes: Uint8Array; mime: string } | null {
  if (!body.startsWith("data:")) return null;
  const comma = body.indexOf(",");
  if (comma === -1) return null;
  const header = body.slice(0, comma);
  const data = body.slice(comma + 1);
  const mimeMatch = header.match(/data:([^;,]+)/);
  const mime = mimeMatch?.[1]?.trim() ?? "application/octet-stream";
  const isBase64 = /;base64/i.test(header);
  if (isBase64) {
    return {
      bytes: new Uint8Array(Buffer.from(data, "base64")),
      mime,
    };
  }
  try {
    return {
      bytes: new TextEncoder().encode(decodeURIComponent(data)),
      mime,
    };
  } catch {
    return null;
  }
}
