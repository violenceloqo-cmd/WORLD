import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

/** flagcdn.com codes for non-standard ISO slugs in countries.ts */
const FLAG_OVERRIDES: Record<string, string> = {
  eng: "gb-eng",
  sct: "gb-sct",
};

const CACHE_DIR = path.join(process.cwd(), ".cache", "flags");

export function flagcdnCode(iso: string): string {
  return FLAG_OVERRIDES[iso.toLowerCase()] ?? iso.toLowerCase();
}

/**
 * Download a literal country flag PNG and normalize to 1024×1024 (pump.fun minimum).
 */
export async function fetchFlagPng(iso: string): Promise<Buffer> {
  await fs.mkdir(CACHE_DIR, { recursive: true });
  const cachePath = path.join(CACHE_DIR, `${iso.toLowerCase()}.png`);

  try {
    const cached = await fs.readFile(cachePath);
    if (cached.byteLength > 0) return cached;
  } catch {
    // cache miss
  }

  const code = flagcdnCode(iso);
  const url = `https://flagcdn.com/w1280/${code}.png`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch flag for ${iso} (${url}): ${res.status}`);
  }

  const raw = Buffer.from(await res.arrayBuffer());
  const png = await sharp(raw)
    .resize(1024, 1024, { fit: "cover", position: "centre" })
    .png()
    .toBuffer();

  await fs.writeFile(cachePath, png);
  return png;
}
