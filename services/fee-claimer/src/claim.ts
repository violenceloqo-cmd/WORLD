import { Connection } from "@solana/web3.js";
import type { AppConfig, CountryConfig } from "./config.js";
import type { Logger } from "./logger.js";
import { buildCollectFeesTx } from "./pumpfun.js";
import {
  formatSol,
  getBalanceLamports,
  signSendConfirm,
  solscanTx,
  transferLamports,
} from "./solana.js";
import type { TelegramNotifier } from "./telegram.js";

export type CycleOutcome =
  | { kind: "skipped"; reason: string }
  | { kind: "claimed_no_forward"; claimSig: string; reason: string }
  | { kind: "forwarded"; claimSig: string | null; xferSig: string; sentLamports: bigint }
  | { kind: "error"; err: Error };

/**
 * Run one full claim-and-forward cycle for a single country.
 * Errors are caught and returned as a structured outcome so that one
 * country's failure cannot poison the others.
 */
export async function claimAndForward(args: {
  cfg: AppConfig;
  country: CountryConfig;
  connection: Connection;
  log: Logger;
  tg: TelegramNotifier;
}): Promise<CycleOutcome> {
  const { cfg, country, connection, log, tg } = args;
  const tag = `[${country.iso}]`;
  const devAddr = country.keypair.publicKey;

  try {
    log.info({ iso: country.iso, dev: devAddr.toBase58() }, `${tag} cycle start`);

    // ------------------------------------------------------------------
    // Step 1 — Ask pump.fun to build a collect-fees tx. The API itself
    // tells us if there's nothing to claim (it will either return a tx
    // that simulates to no movement, or — more useful — we infer "empty"
    // from the post-claim balance delta). We can't cheaply pre-read the
    // pending fee amount without re-implementing the SDK, so we rely on
    // the dev-wallet balance delta as the source of truth.
    // ------------------------------------------------------------------
    const balanceBefore = await getBalanceLamports(connection, devAddr);
    log.debug(
      { balanceBefore: balanceBefore.toString() },
      `${tag} dev wallet balance before claim`,
    );

    // ------------------------------------------------------------------
    // Step 2 — Build + sign + send the claim transaction. In dry-run we
    // build but don't sign or send.
    // ------------------------------------------------------------------
    let claimSig: string | null = null;
    if (cfg.dryRun) {
      log.info(`${tag} DRY_RUN: would request collect-fees tx from pump.fun`);
    } else {
      const built = await buildCollectFeesTx({
        mint: country.mint,
        user: devAddr,
      });

      if (built.usesSharingConfig) {
        // Our flagship coins should NOT use a sharing config. If one
        // appeared, bail loudly rather than distributing to unexpected
        // addresses.
        const msg =
          `${tag} mint uses sharing config — refusing to auto-distribute. ` +
          `Investigate before re-enabling.`;
        await tg.error(msg);
        return { kind: "error", err: new Error(msg) };
      }

      claimSig = await signSendConfirm(connection, built.transaction, country.keypair);
      log.info({ claimSig, url: solscanTx(claimSig) }, `${tag} claim confirmed`);
    }

    // ------------------------------------------------------------------
    // Step 3 — Decide how much to forward. Anything above the reserve.
    // ------------------------------------------------------------------
    const balanceAfter = await getBalanceLamports(connection, devAddr);
    const claimed = balanceAfter - balanceBefore;
    log.debug(
      { balanceAfter: balanceAfter.toString(), claimed: claimed.toString() },
      `${tag} dev wallet balance after claim`,
    );

    const reserve = cfg.reserveLamports;
    const sendable = balanceAfter > reserve ? balanceAfter - reserve : 0n;

    if (sendable < cfg.minClaimLamports) {
      const reason = `nothing meaningful to forward (sendable=${formatSol(
        sendable,
      )}, threshold=${formatSol(cfg.minClaimLamports)})`;
      log.info(`${tag} ${reason}`);
      await tg.info(
        `${countryEmoji(country.iso)} <b>${country.iso}</b>: below threshold — no forward this cycle.`,
      );
      return claimSig
        ? { kind: "claimed_no_forward", claimSig, reason }
        : { kind: "skipped", reason };
    }

    // ------------------------------------------------------------------
    // Step 4 — Transfer to the $WORLD dev wallet.
    // ------------------------------------------------------------------
    if (cfg.dryRun) {
      log.info(
        `${tag} DRY_RUN: would transfer ${formatSol(sendable)} → ${cfg.worldDevWallet.toBase58()}`,
      );
      await tg.info(
        `${countryEmoji(country.iso)} <b>${country.iso}</b> (DRY RUN): ` +
          `would send <b>${formatSol(sendable)}</b> to $WORLD dev.`,
      );
      return {
        kind: "forwarded",
        claimSig,
        xferSig: "DRY_RUN",
        sentLamports: sendable,
      };
    }

    const xferSig = await transferLamports({
      connection,
      from: country.keypair,
      to: cfg.worldDevWallet,
      lamports: sendable,
      priorityMicroLamports: cfg.priorityMicroLamports,
    });
    log.info({ xferSig, url: solscanTx(xferSig) }, `${tag} transfer confirmed`);

    const msg =
      `${countryEmoji(country.iso)} <b>${country.iso}</b>: claimed + sent ` +
      `<b>${formatSol(sendable)}</b> to $WORLD dev.\n` +
      (claimSig ? `claim: <a href="${solscanTx(claimSig)}">${shortSig(claimSig)}</a>\n` : "") +
      `xfer: <a href="${solscanTx(xferSig)}">${shortSig(xferSig)}</a>`;
    await tg.success(msg);

    return { kind: "forwarded", claimSig, xferSig, sentLamports: sendable };
  } catch (err) {
    const e = err instanceof Error ? err : new Error(String(err));
    log.error({ err: e.message, stack: e.stack }, `${tag} cycle failed`);
    await tg.error(
      `${countryEmoji(country.iso)} <b>${country.iso}</b> failed:\n<code>${escapeHtml(
        e.message,
      )}</code>`,
    );
    return { kind: "error", err: e };
  }
}

function countryEmoji(iso: string): string {
  switch (iso) {
    case "USA":
      return "🇺🇸";
    case "CHN":
      return "🇨🇳";
    case "RUS":
      return "🇷🇺";
    default:
      return "🏳️";
  }
}

function shortSig(sig: string): string {
  return `${sig.slice(0, 6)}…${sig.slice(-6)}`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
