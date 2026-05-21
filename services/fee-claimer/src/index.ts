import { Connection } from "@solana/web3.js";
import cron from "node-cron";
import { loadConfig } from "./config.js";
import { createLogger } from "./logger.js";
import { claimAndForward } from "./claim.js";
import { TelegramNotifier } from "./telegram.js";
import { formatSol } from "./solana.js";

async function runCycle(deps: {
  cfg: ReturnType<typeof loadConfig>;
  connection: Connection;
  log: ReturnType<typeof createLogger>;
  tg: TelegramNotifier;
}) {
  const { cfg, connection, log, tg } = deps;

  if (cfg.paused) {
    log.warn("PAUSED=true — skipping this cycle");
    await tg.info("⏸️ fee-claimer PAUSED — skipping cycle.");
    return;
  }

  const started = Date.now();
  log.info(
    {
      countries: cfg.countries.map((c) => c.iso),
      dryRun: cfg.dryRun,
    },
    "cycle starting",
  );

  let totalForwarded = 0n;
  let errors = 0;
  for (const country of cfg.countries) {
    const outcome = await claimAndForward({
      cfg,
      country,
      connection,
      log,
      tg,
    });
    if (outcome.kind === "forwarded") {
      totalForwarded += outcome.sentLamports;
    }
    if (outcome.kind === "error") {
      errors += 1;
    }
  }

  const elapsedMs = Date.now() - started;
  log.info(
    {
      elapsedMs,
      totalForwarded: totalForwarded.toString(),
      errors,
    },
    "cycle complete",
  );

  if (totalForwarded > 0n) {
    await tg.success(
      `✅ <b>Cycle complete</b> — forwarded <b>${formatSol(
        totalForwarded,
      )}</b> to $WORLD dev across ${cfg.countries.length} coins. (${elapsedMs} ms)`,
    );
  }
}

// ----------------------------------------------------------------------
// Single-instance lock: cron can fire while a slow previous cycle is
// still running. We refuse to overlap.
// ----------------------------------------------------------------------
let inFlight = false;

async function safeRunCycle(deps: Parameters<typeof runCycle>[0]) {
  if (inFlight) {
    deps.log.warn("previous cycle still running, skipping tick");
    return;
  }
  inFlight = true;
  try {
    await runCycle(deps);
  } catch (err) {
    deps.log.error({ err }, "uncaught cycle error");
    const e = err instanceof Error ? err.message : String(err);
    await deps.tg.error(`Uncaught cycle error:\n<code>${e}</code>`);
  } finally {
    inFlight = false;
  }
}

async function main() {
  const cfg = loadConfig();
  const log = createLogger(cfg.logLevel);
  const tg = new TelegramNotifier(cfg.telegram, log);
  const connection = new Connection(cfg.rpcUrl, "confirmed");

  log.info(
    {
      dryRun: cfg.dryRun,
      paused: cfg.paused,
      cron: cfg.cronSchedule,
      minClaim: formatSol(cfg.minClaimLamports),
      reserve: formatSol(cfg.reserveLamports),
      destination: cfg.worldDevWallet.toBase58(),
      countries: cfg.countries.map((c) => ({
        iso: c.iso,
        mint: c.mint.toBase58(),
        dev: c.keypair.publicKey.toBase58(),
      })),
      telegram: tg.enabled ? "enabled" : "disabled",
    },
    "fee-claimer booting",
  );

  // Boot ping so you immediately know the bot is alive.
  if (tg.enabled) {
    await tg.success(
      `🚀 <b>fee-claimer started</b>\n` +
        `mode: ${cfg.dryRun ? "DRY RUN" : "LIVE"}\n` +
        `schedule: <code>${cfg.cronSchedule}</code>\n` +
        `destination: <code>${cfg.worldDevWallet.toBase58()}</code>`,
    );
  }

  const deps = { cfg, connection, log, tg };

  // Allow a one-shot run for local testing: `npm run once`
  if (process.argv.includes("--once")) {
    await safeRunCycle(deps);
    log.info("one-shot run done, exiting");
    return;
  }

  // Run once at boot so you don't have to wait 10 minutes to see life signs.
  await safeRunCycle(deps);

  cron.schedule(cfg.cronSchedule, () => {
    void safeRunCycle(deps);
  });

  log.info("cron scheduled, awaiting ticks…");

  // Graceful shutdown
  const shutdown = (sig: string) => {
    log.warn({ sig }, "shutting down");
    if (tg.enabled) {
      void tg.info(`🛑 fee-claimer received <code>${sig}</code> — exiting.`);
    }
    setTimeout(() => process.exit(0), 500);
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("fatal:", err);
  process.exit(1);
});
