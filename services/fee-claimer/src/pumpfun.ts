import { PublicKey, VersionedTransaction } from "@solana/web3.js";

const PUMPFUN_AGENTS_URL = "https://fun-block.pump.fun/agents/collect-fees";

export type BuildCollectFeesResult = {
  /** Unsigned VersionedTransaction (deserialized from base64). */
  transaction: VersionedTransaction;
  /** Creator address recorded on-chain for the coin. */
  creator: PublicKey;
  /** Whether the coin has graduated to the AMM. Informational only. */
  isGraduated: boolean;
  /** Whether the coin uses a sharing config. We expect false for our coins. */
  usesSharingConfig: boolean;
};

/**
 * Ask the official pump.fun agents API to build a "collect creator fee"
 * transaction. The returned VersionedTransaction is unsigned — the caller
 * must sign with the creator's keypair and send to the RPC.
 *
 * Docs: https://github.com/pump-fun/pump-fun-skills/blob/main/coin-fees/SKILL.md
 */
export async function buildCollectFeesTx(args: {
  mint: PublicKey;
  user: PublicKey;
}): Promise<BuildCollectFeesResult> {
  const res = await fetch(PUMPFUN_AGENTS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mint: args.mint.toBase58(),
      user: args.user.toBase58(),
      frontRunningProtection: false,
      tipAmount: 0,
      encoding: "base64",
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `pump.fun collect-fees returned ${res.status}: ${body.slice(0, 500)}`,
    );
  }

  const json = (await res.json()) as {
    transaction?: string;
    creator?: string;
    isGraduated?: boolean;
    usesSharingConfig?: boolean;
  };

  if (!json.transaction || !json.creator) {
    throw new Error(
      `pump.fun collect-fees response missing fields: ${JSON.stringify(json)}`,
    );
  }

  const txBytes = Buffer.from(json.transaction, "base64");
  const tx = VersionedTransaction.deserialize(txBytes);

  return {
    transaction: tx,
    creator: new PublicKey(json.creator),
    isGraduated: Boolean(json.isGraduated),
    usesSharingConfig: Boolean(json.usesSharingConfig),
  };
}
