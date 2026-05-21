import "dotenv/config";
import { Keypair, PublicKey } from "@solana/web3.js";
import bs58 from "bs58";

export type Iso = "USA" | "CHN" | "RUS";

export type CountryConfig = {
  iso: Iso;
  /** Pump.fun mint address (base58). */
  mint: PublicKey;
  /** Dev wallet that created the coin on pump.fun. Holds claim authority. */
  keypair: Keypair;
};

export type AppConfig = {
  rpcUrl: string;
  worldDevWallet: PublicKey;
  countries: CountryConfig[];

  cronSchedule: string;
  minClaimLamports: bigint;
  reserveLamports: bigint;
  priorityMicroLamports: number;
  computeUnits: number;

  dryRun: boolean;
  paused: boolean;
  logLevel: string;

  telegram: {
    botToken: string | null;
    chatId: string | null;
    verbose: boolean;
  };
};

function required(name: string): string {
  const v = process.env[name];
  if (!v || v.trim() === "") {
    throw new Error(`Missing required env var: ${name}`);
  }
  return v.trim();
}

function optional(name: string): string | null {
  const v = process.env[name];
  if (!v || v.trim() === "") return null;
  return v.trim();
}

function boolEnv(name: string, fallback: boolean): boolean {
  const v = process.env[name];
  if (v === undefined) return fallback;
  return /^(1|true|yes|on)$/i.test(v.trim());
}

function intEnv(name: string, fallback: number): number {
  const v = process.env[name];
  if (!v) return fallback;
  const n = Number.parseInt(v, 10);
  if (!Number.isFinite(n)) throw new Error(`Env ${name} is not an integer: ${v}`);
  return n;
}

function bigintEnv(name: string, fallback: bigint): bigint {
  const v = process.env[name];
  if (!v) return fallback;
  try {
    return BigInt(v);
  } catch {
    throw new Error(`Env ${name} is not an integer: ${v}`);
  }
}

function loadKeypair(name: string): Keypair {
  const raw = required(name);
  let bytes: Uint8Array;
  try {
    bytes = bs58.decode(raw);
  } catch (err) {
    throw new Error(`Env ${name} is not valid base58: ${(err as Error).message}`);
  }
  if (bytes.length !== 64) {
    throw new Error(
      `Env ${name} decoded to ${bytes.length} bytes; expected 64 (a Solana secret key).`,
    );
  }
  return Keypair.fromSecretKey(bytes);
}

function loadPubkey(name: string): PublicKey {
  const raw = required(name);
  try {
    return new PublicKey(raw);
  } catch {
    throw new Error(`Env ${name} is not a valid base58 Solana address: ${raw}`);
  }
}

/**
 * Load and validate the full app config.
 * Throws on missing / malformed values so we fail loudly at boot rather
 * than silently mid-cycle.
 */
export function loadConfig(): AppConfig {
  const dryRun = boolEnv("DRY_RUN", true);

  // In dry-run we still want to be able to test wiring without real keys.
  // To keep it strict-but-friendly, we allow placeholder keys only when
  // DRY_RUN=true AND the var is the literal string "DRY_RUN_PLACEHOLDER".
  const loadKeyOrPlaceholder = (name: string): Keypair => {
    const v = process.env[name];
    if (dryRun && v === "DRY_RUN_PLACEHOLDER") {
      return Keypair.generate();
    }
    return loadKeypair(name);
  };

  const countries: CountryConfig[] = [
    {
      iso: "USA",
      mint: loadPubkey("MINT_USA"),
      keypair: loadKeyOrPlaceholder("DEV_USA_PRIVATE_KEY"),
    },
    {
      iso: "CHN",
      mint: loadPubkey("MINT_CHN"),
      keypair: loadKeyOrPlaceholder("DEV_CHN_PRIVATE_KEY"),
    },
    {
      iso: "RUS",
      mint: loadPubkey("MINT_RUS"),
      keypair: loadKeyOrPlaceholder("DEV_RUS_PRIVATE_KEY"),
    },
  ];

  return {
    rpcUrl: required("SOLANA_RPC_URL"),
    worldDevWallet: loadPubkey("WORLD_DEV_WALLET"),
    countries,
    cronSchedule: process.env.CRON_SCHEDULE?.trim() || "*/10 * * * *",
    minClaimLamports: bigintEnv("MIN_CLAIM_LAMPORTS", 10_000_000n),
    reserveLamports: bigintEnv("RESERVE_LAMPORTS", 3_000_000n),
    priorityMicroLamports: intEnv("PRIORITY_MICRO_LAMPORTS", 100_000),
    computeUnits: intEnv("COMPUTE_UNITS", 200_000),
    dryRun,
    paused: boolEnv("PAUSED", false),
    logLevel: process.env.LOG_LEVEL?.trim() || "info",
    telegram: {
      botToken: optional("TELEGRAM_BOT_TOKEN"),
      chatId: optional("TELEGRAM_CHAT_ID"),
      verbose: boolEnv("TELEGRAM_VERBOSE", true),
    },
  };
}
