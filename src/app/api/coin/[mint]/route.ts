import { NextResponse } from "next/server";
import { getCountryByMint } from "@/data/countries";
import { getHolderCount } from "@/lib/holders";
import { getMarketData } from "@/lib/market";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ mint: string }> },
) {
  const { mint } = await params;
  if (!mint) {
    return NextResponse.json({ error: "missing mint" }, { status: 400 });
  }
  const market = await getMarketData(mint);
  const holders = await getHolderCount(mint);
  const country = getCountryByMint(mint) ?? null;
  return NextResponse.json(
    { mint, country, market: { ...market, holders }, holders },
    {
      headers: {
        "Cache-Control": "public, s-maxage=10, stale-while-revalidate=20",
      },
    },
  );
}
