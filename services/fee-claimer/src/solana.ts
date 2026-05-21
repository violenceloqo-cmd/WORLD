import {
  ComputeBudgetProgram,
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";

export const LAMPORTS_PER_SOL = 1_000_000_000n;

export function formatSol(lamports: bigint): string {
  const sign = lamports < 0n ? "-" : "";
  const abs = lamports < 0n ? -lamports : lamports;
  const whole = abs / LAMPORTS_PER_SOL;
  const frac = abs % LAMPORTS_PER_SOL;
  const fracStr = frac.toString().padStart(9, "0").replace(/0+$/, "");
  return fracStr ? `${sign}${whole}.${fracStr} SOL` : `${sign}${whole} SOL`;
}

export async function getBalanceLamports(
  connection: Connection,
  pubkey: PublicKey,
): Promise<bigint> {
  const lamports = await connection.getBalance(pubkey, "confirmed");
  return BigInt(lamports);
}

/**
 * Sign and send a VersionedTransaction built by an external source
 * (e.g. pump.fun's /agents/collect-fees). Confirms at "confirmed".
 */
export async function signSendConfirm(
  connection: Connection,
  tx: VersionedTransaction,
  signer: Keypair,
): Promise<string> {
  tx.sign([signer]);
  const signature = await connection.sendRawTransaction(tx.serialize(), {
    skipPreflight: false,
    preflightCommitment: "confirmed",
    maxRetries: 3,
  });
  const latest = await connection.getLatestBlockhash("confirmed");
  await connection.confirmTransaction(
    { signature, ...latest },
    "confirmed",
  );
  return signature;
}

/**
 * Build, sign, send and confirm a simple SystemProgram.transfer.
 * Includes a small priority fee so it lands quickly.
 */
export async function transferLamports(args: {
  connection: Connection;
  from: Keypair;
  to: PublicKey;
  lamports: bigint;
  priorityMicroLamports: number;
}): Promise<string> {
  const { connection, from, to, lamports, priorityMicroLamports } = args;

  const latest = await connection.getLatestBlockhash("confirmed");
  const instructions = [
    ComputeBudgetProgram.setComputeUnitLimit({ units: 10_000 }),
    ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: priorityMicroLamports,
    }),
    SystemProgram.transfer({
      fromPubkey: from.publicKey,
      toPubkey: to,
      lamports: Number(lamports),
    }),
  ];

  const message = new TransactionMessage({
    payerKey: from.publicKey,
    recentBlockhash: latest.blockhash,
    instructions,
  }).compileToV0Message();

  const tx = new VersionedTransaction(message);
  tx.sign([from]);

  const signature = await connection.sendRawTransaction(tx.serialize(), {
    skipPreflight: false,
    preflightCommitment: "confirmed",
    maxRetries: 3,
  });
  await connection.confirmTransaction(
    { signature, ...latest },
    "confirmed",
  );
  return signature;
}

export function solscanTx(signature: string): string {
  return `https://solscan.io/tx/${signature}`;
}
