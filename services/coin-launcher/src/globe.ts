import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const here = path.dirname(fileURLToPath(import.meta.url));
const BASE_GLOBE = path.join(here, "../assets/globe-base.png");
const CACHE_DIR = path.join(process.cwd(), ".cache", "globes");
const SIZE = 1024;

type RGB = [number, number, number];

/** #RRGGBB -> [r,g,b]. Throws on bad input so a typo never silently mis-colors a coin. */
function hexToRgb(hex: string): RGB {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) throw new Error(`Invalid hex color: ${hex}`);
  const n = parseInt(m[1]!, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Perceived luminance (Rec. 709) in 0..255, used to order the two flag colors. */
function luma([r, g, b]: RGB): number {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpRgb(a: RGB, b: RGB, t: number): RGB {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}

/**
 * Build a 256-entry gradient lookup table from black -> darker flag color ->
 * lighter flag color -> white. Mapping the globe's luminance through this keeps
 * the black background black and the bright flares white, while the planet body
 * and atmospheric halo take on the country's colors.
 */
function buildLut(colors: [string, string]): RGB[] {
  const [c1, c2] = [hexToRgb(colors[0]), hexToRgb(colors[1])];
  const [dark, light] = luma(c1) <= luma(c2) ? [c1, c2] : [c2, c1];

  const stops: { pos: number; color: RGB }[] = [
    { pos: 0.0, color: [0, 0, 0] },
    { pos: 0.34, color: dark },
    { pos: 0.7, color: light },
    { pos: 1.0, color: [255, 255, 255] },
  ];

  const lut: RGB[] = new Array(256);
  for (let i = 0; i < 256; i++) {
    const g = i / 255;
    let s = 0;
    while (s < stops.length - 2 && g > stops[s + 1]!.pos) s++;
    const a = stops[s]!;
    const b = stops[s + 1]!;
    const t = (g - a.pos) / (b.pos - a.pos);
    lut[i] = lerpRgb(a.color, b.color, Math.max(0, Math.min(1, t)));
  }
  return lut;
}

/**
 * Render the WORLD globe recolored in a country's palette.
 * Returns a 1024x1024 PNG buffer ready for the pump.fun image upload.
 */
export async function renderCountryGlobe(
  iso: string,
  colors: [string, string],
): Promise<Buffer> {
  await fs.mkdir(CACHE_DIR, { recursive: true });
  const cachePath = path.join(CACHE_DIR, `${iso.toLowerCase()}.png`);

  try {
    const cached = await fs.readFile(cachePath);
    if (cached.byteLength > 0) return cached;
  } catch {
    // cache miss
  }

  const lut = buildLut(colors);

  // Luminance of the base globe at full resolution.
  const { data, info } = await sharp(BASE_GLOBE)
    .resize(SIZE, SIZE, { fit: "cover", position: "centre" })
    .removeAlpha()
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const px = info.width * info.height;
  const out = Buffer.allocUnsafe(px * 3);
  for (let i = 0; i < px; i++) {
    const c = lut[data[i]!]!;
    const o = i * 3;
    out[o] = c[0];
    out[o + 1] = c[1];
    out[o + 2] = c[2];
  }

  const png = await sharp(out, {
    raw: { width: info.width, height: info.height, channels: 3 },
  })
    .png()
    .toBuffer();

  await fs.writeFile(cachePath, png);
  return png;
}
