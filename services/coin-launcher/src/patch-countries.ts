import fs from "node:fs/promises";
import path from "node:path";

const COUNTRIES_FILE = path.resolve(
  import.meta.dirname,
  "../../../src/data/countries.ts",
);

/** Write a mint address into the matching country line in countries.ts */
export async function patchCountryMint(iso: string, mint: string): Promise<void> {
  const src = await fs.readFile(COUNTRIES_FILE, "utf8");
  const pattern = new RegExp(
    `(\\{ iso: "${iso.toLowerCase()}"[^\\n]*mint: ")([^"]*)(")`,
  );

  if (!pattern.test(src)) {
    throw new Error(`Could not find country iso="${iso}" in countries.ts`);
  }

  const next = src.replace(pattern, `$1${mint}$3`);
  await fs.writeFile(COUNTRIES_FILE, next);
}

export type DeploymentRecord = {
  iso: string;
  name: string;
  ticker: string;
  mint: string;
  signature: string;
  metadataUri: string;
  pumpUrl: string;
  deployedAt: string;
};

const LOG_FILE = path.join(process.cwd(), "deployments.json");

export async function readDeploymentLog(): Promise<DeploymentRecord[]> {
  try {
    const raw = await fs.readFile(LOG_FILE, "utf8");
    return JSON.parse(raw) as DeploymentRecord[];
  } catch {
    return [];
  }
}

export async function appendDeploymentLog(
  record: DeploymentRecord,
): Promise<void> {
  const existing = await readDeploymentLog();
  const filtered = existing.filter((r) => r.iso !== record.iso);
  filtered.push(record);
  await fs.writeFile(LOG_FILE, JSON.stringify(filtered, null, 2) + "\n");
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
