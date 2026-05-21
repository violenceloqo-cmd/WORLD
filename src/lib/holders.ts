/**
 * Unique holder count for a Solana SPL token via Helius RPC.
 *
 * Requires HELIUS_API_KEY in .env.local (free tier at https://helius.dev).
 * Returns null when the key is missing or the call fails — the UI shows "—".
 *
 * DexScreener's public API does not expose holder counts, so this is
 * the only optional enrichment for that stat.
 */

const HELIUS_BASE = "https://mainnet.helius-rpc.com";
const HELIUS_MAX_PAGES = 10;
const HELIUS_PAGE_SIZE = 1000;

type HeliusTokenAccountsResponse = {
  result?: {
    total?: number;
    token_accounts?: Array<{
      owner?: string;
      amount?: string | number;
    }>;
    cursor?: string;
  };
};

export async function getHolderCount(mint: string): Promise<number | null> {
  return fetchHeliusHolders(mint);
}

export async function getHolderCounts(
  mints: Array<string | null | undefined>,
): Promise<Array<number | null>> {
  return Promise.all(
    mints.map(async (m) => (m ? await getHolderCount(m) : null)),
  );
}

async function fetchHeliusHolders(mint: string): Promise<number | null> {
  const key = process.env.HELIUS_API_KEY;
  if (!key) return null;

  try {
    const owners = new Set<string>();
    let cursor: string | undefined;

    for (let page = 0; page < HELIUS_MAX_PAGES; page++) {
      const res = await fetch(`${HELIUS_BASE}/?api-key=${key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "holders",
          method: "getTokenAccounts",
          params: {
            mint,
            limit: HELIUS_PAGE_SIZE,
            cursor,
            options: { showZeroBalance: false },
          },
        }),
        cache: "no-store",
      });
      if (!res.ok) break;

      const json = (await res.json()) as HeliusTokenAccountsResponse;
      const accounts = json.result?.token_accounts ?? [];
      if (accounts.length === 0) break;

      for (const a of accounts) {
        const amt = a.amount;
        const nonZero =
          amt !== undefined &&
          (typeof amt === "string" ? amt !== "0" : amt > 0);
        if (nonZero && a.owner) owners.add(a.owner);
      }

      cursor = json.result?.cursor;
      if (!cursor || accounts.length < HELIUS_PAGE_SIZE) break;
    }

    return owners.size > 0 ? owners.size : null;
  } catch {
    return null;
  }
}
