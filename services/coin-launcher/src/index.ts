import bs58 from "bs58";
import { Keypair, Connection } from "@solana/web3.js";
import { COUNTRIES, resolveMint } from "../../../src/data/countries.ts";
import {
  LAUNCHER,
  countryPageUrl,
  loadConfig,
} from "./config.js";
import { createUsdcCoin, assertWalletFunded } from "./create-coin.js";
import { fetchFlagPng } from "./flags.js";
import { uploadMetadata } from "./ipfs.js";
import {
  appendDeploymentLog,
  patchCountryMint,
  readDeploymentLog,
  sleep,
  type DeploymentRecord,
} from "./patch-countries.js";

function parseArgs(argv: string[]) {
  const dryRun = argv.includes("--dry-run");
  const skipMinted = !argv.includes("--force");
  const onlyIdx = argv.indexOf("--only");
  const only =
    onlyIdx >= 0 && argv[onlyIdx + 1]
      ? argv[onlyIdx + 1]!.split(",").map((s) => s.trim().toLowerCase())
      : null;

  return { dryRun, skipMinted, only };
}

function loadPayer(secret: string): Keypair {
  try {
    return Keypair.fromSecretKey(bs58.decode(secret));
  } catch {
    throw new Error("DEPLOYER_PRIVATE_KEY must be a base58-encoded secret key");
  }
}

async function main() {
  const { dryRun, skipMinted, only } = parseArgs(process.argv.slice(2));
  const cfg = loadConfig({ requireWallet: !dryRun });
  const payer = dryRun ? null : loadPayer(cfg.secret);
  const connection = new Connection(cfg.rpcUrl, "confirmed");

  let countries = COUNTRIES;
  if (only?.length) {
    countries = countries.filter((c) => only.includes(c.iso.toLowerCase()));
    if (countries.length === 0) {
      throw new Error(`No countries matched --only ${only.join(",")}`);
    }
  }

  const log = await readDeploymentLog();
  const logged = new Set(log.map((r) => r.iso));

  const pending = countries.filter((c) => {
    if (skipMinted && resolveMint(c.mint)) return false;
    if (skipMinted && logged.has(c.iso)) return false;
    return true;
  });

  console.log("World Coin — USDC pair launcher");
  console.log(`  Site:     https://worldcoins.fun/`);
  console.log(`  Twitter:  https://x.com/worldcoinspump`);
  console.log(`  Wallet:   ${dryRun ? "(dry-run — no wallet)" : payer!.publicKey.toBase58()}`);
  console.log(`  Pair:     USDC`);
  console.log(`  Pending:  ${pending.length} / ${countries.length}`);
  if (dryRun) console.log("  Mode:     DRY RUN (no txs)\n");
  else console.log("");

  if (pending.length === 0) {
    console.log("Nothing to deploy.");
    return;
  }

  if (!dryRun) {
    await assertWalletFunded(connection, payer!.publicKey, 0.5);
  }

  for (let i = 0; i < pending.length; i++) {
    const c = pending[i]!;
    const tag = `[${i + 1}/${pending.length}] ${c.flagEmoji} ${c.name} ($${c.ticker})`;

    console.log(`${tag}`);
    console.log(`  iso: ${c.iso}  page: ${countryPageUrl(c.iso)}`);

    if (dryRun) {
      console.log(`  (dry-run) would create USDC-paired coin "${c.name}" / ${c.ticker}\n`);
      continue;
    }

    let lastErr: unknown;
    for (let attempt = 1; attempt <= LAUNCHER.maxRetries; attempt++) {
      try {
        const imagePng = await fetchFlagPng(c.iso);
        const { metadataUri } = await uploadMetadata(
          {
            name: c.name,
            symbol: c.ticker,
            iso: c.iso,
            website: countryPageUrl(c.iso),
            imagePng,
          },
          cfg.pinataJwt,
        );

        const mintKeypair = Keypair.generate();
        const { signature, mint } = await createUsdcCoin({
          connection,
          payer: payer!,
          mintKeypair,
          name: c.name,
          symbol: c.ticker,
          metadataUri,
        });

        const record: DeploymentRecord = {
          iso: c.iso,
          name: c.name,
          ticker: c.ticker,
          mint,
          signature,
          metadataUri,
          pumpUrl: `https://pump.fun/coin/${mint}`,
          deployedAt: new Date().toISOString(),
        };

        await patchCountryMint(c.iso, mint);
        await appendDeploymentLog(record);

        console.log(`  mint: ${mint}`);
        console.log(`  tx:   https://solscan.io/tx/${signature}`);
        console.log(`  url:  ${record.pumpUrl}\n`);

        if (i < pending.length - 1) {
          await sleep(LAUNCHER.delayMs);
        }
        lastErr = null;
        break;
      } catch (err) {
        lastErr = err;
        console.warn(
          `  attempt ${attempt}/${LAUNCHER.maxRetries} failed: ${err instanceof Error ? err.message : err}`,
        );
        if (attempt < LAUNCHER.maxRetries) await sleep(5_000);
      }
    }

    if (lastErr) {
      console.error(`  FAILED — stopping batch. Fix and re-run (already deployed coins are skipped).`);
      throw lastErr;
    }
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
