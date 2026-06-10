import { PUMP_SDK } from "@pump-fun/pump-sdk";
import {
  ComputeBudgetProgram,
  Connection,
  Keypair,
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
  type Signer,
} from "@solana/web3.js";
import { USDC_MINT } from "./config.js";

export type CreateUsdcCoinInput = {
  connection: Connection;
  payer: Signer;
  mintKeypair: Keypair;
  name: string;
  symbol: string;
  metadataUri: string;
};

export type CreateUsdcCoinResult = {
  signature: string;
  mint: string;
};

/**
 * Create a pump.fun coin on a USDC-paired bonding curve (no initial buy).
 * @see https://github.com/pump-fun/pump-public-docs/blob/main/docs/instructions/COIN_CREATION.md
 */
export async function createUsdcCoin(
  input: CreateUsdcCoinInput,
): Promise<CreateUsdcCoinResult> {
  const creator = input.payer.publicKey;

  const createIx = await PUMP_SDK.createV2Instruction({
    mint: input.mintKeypair.publicKey,
    name: input.name,
    symbol: input.symbol,
    uri: input.metadataUri,
    creator,
    user: creator,
    mayhemMode: false,
    cashback: false,
    quoteMint: USDC_MINT,
  });

  const computeIx = ComputeBudgetProgram.setComputeUnitLimit({ units: 350_000 });
  const priorityIx = ComputeBudgetProgram.setComputeUnitPrice({
    microLamports: 50_000,
  });

  const { blockhash, lastValidBlockHeight } =
    await input.connection.getLatestBlockhash("confirmed");

  const message = new TransactionMessage({
    payerKey: creator,
    recentBlockhash: blockhash,
    instructions: [computeIx, priorityIx, createIx],
  }).compileToV0Message();

  const tx = new VersionedTransaction(message);
  tx.sign([input.payer, input.mintKeypair]);

  const signature = await input.connection.sendTransaction(tx, {
    skipPreflight: false,
    preflightCommitment: "confirmed",
    maxRetries: 3,
  });

  await input.connection.confirmTransaction(
    { signature, blockhash, lastValidBlockHeight },
    "confirmed",
  );

  return {
    signature,
    mint: input.mintKeypair.publicKey.toBase58(),
  };
}

export async function assertWalletFunded(
  connection: Connection,
  pubkey: PublicKey,
  minSol: number,
): Promise<void> {
  const lamports = await connection.getBalance(pubkey, "confirmed");
  const sol = lamports / 1e9;
  if (sol < minSol) {
    throw new Error(
      `Wallet ${pubkey.toBase58()} has ${sol.toFixed(4)} SOL; need at least ${minSol} SOL for ~48 creates`,
    );
  }
}
