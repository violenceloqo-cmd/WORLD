import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PublicKey } from "@solana/web3.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../../..");
const launcherEnv = path.join(here, "../.env");
const rootEnv = path.join(repoRoot, ".env");

/** Load .env; skip blank values so `KEY=` placeholders do not wipe real secrets. */
function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  const parsed = dotenv.parse(fs.readFileSync(filePath));
  for (const [key, value] of Object.entries(parsed)) {
    if (value.trim()) process.env[key] = value;
  }
}

// Root .env first (DEPLOYER_PRIVATE_KEY, HELIUS_API_KEY), then launcher overrides.
loadEnvFile(rootEnv);
loadEnvFile(launcherEnv);

/** Mainnet USDC — pump.fun USDC-paired bonding curve quote mint. */
export const USDC_MINT = new PublicKey(
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
);

export const SITE_URL = "https://worldcoins.fun";
export const TWITTER_URL = "https://x.com/worldcoinspump";

export const PUMP_IPFS_URL = "https://pump.fun/api/ipfs";

export const LAUNCHER = {
  /** Delay between launches to avoid RPC rate limits (ms). */
  delayMs: 3_000,
  /** Max create tx retries per country. */
  maxRetries: 3,
} as const;

export function loadConfig(options?: { requireWallet?: boolean }) {
  const requireWallet = options?.requireWallet ?? true;

  const heliusKey = process.env.HELIUS_API_KEY?.trim();
  const rpcUrl =
    process.env.SOLANA_RPC_URL?.trim() ||
    (heliusKey
      ? `https://mainnet.helius-rpc.com/?api-key=${heliusKey}`
      : "https://api.mainnet-beta.solana.com");

  const secret = process.env.DEPLOYER_PRIVATE_KEY?.trim();

  if (requireWallet && !secret) {
    throw new Error(
      "DEPLOYER_PRIVATE_KEY is required — set it in the repo root .env or services/coin-launcher/.env (base58 secret key)",
    );
  }

  return {
    rpcUrl,
    secret: secret ?? "",
    pinataJwt: process.env.PINATA_JWT?.trim() || null,
  };
}

export function countryPageUrl(iso: string): string {
  return `${SITE_URL}/c/${iso.toLowerCase()}`;
}

export function coinDescription(name: string, iso: string): string {
  return `${name} nation coin in the World Coin league on pump.fun. Ranked live at ${countryPageUrl(iso)}`;
}
