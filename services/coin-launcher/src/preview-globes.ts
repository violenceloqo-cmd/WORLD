import fs from "node:fs/promises";
import path from "node:path";
import { COUNTRIES } from "../../../src/data/countries.ts";
import { renderCountryGlobe } from "./globe.js";

/**
 * Render country globes to ./preview-globes for visual review.
 * Usage: tsx src/preview-globes.ts [iso,iso,...]   (omit args to render all)
 */
async function main() {
  const arg = process.argv[2];
  const only = arg ? arg.split(",").map((s) => s.trim().toLowerCase()) : null;
  const outDir = path.join(process.cwd(), "preview-globes");
  await fs.mkdir(outDir, { recursive: true });

  const list = only
    ? COUNTRIES.filter((c) => only.includes(c.iso.toLowerCase()))
    : COUNTRIES;

  for (const c of list) {
    const png = await renderCountryGlobe(c.iso, c.colors);
    const file = path.join(outDir, `${c.iso}.png`);
    await fs.writeFile(file, png);
    console.log(`${c.flagEmoji} ${c.name.padEnd(20)} ${c.colors.join(" ")} -> ${file}`);
  }
  console.log(`\nDone. ${list.length} globe(s) in ${outDir}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
