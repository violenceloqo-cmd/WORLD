import { PUMP_IPFS_URL, TWITTER_URL, coinDescription } from "./config.js";

export type UploadMetadataInput = {
  name: string;
  symbol: string;
  iso: string;
  website: string;
  imagePng: Buffer;
};

export type UploadMetadataResult = {
  metadataUri: string;
  metadata: Record<string, unknown>;
};

/**
 * Upload coin image + metadata via pump.fun's IPFS endpoint (same flow as the web UI).
 */
export async function uploadMetadataToPump(
  input: UploadMetadataInput,
): Promise<UploadMetadataResult> {
  const description = coinDescription(input.name, input.iso);

  const form = new FormData();
  form.append(
    "file",
    new Blob([input.imagePng], { type: "image/png" }),
    `${input.symbol.toLowerCase()}.png`,
  );
  form.append("name", input.name);
  form.append("symbol", input.symbol);
  form.append("description", description);
  form.append("twitter", TWITTER_URL);
  form.append("website", input.website);
  form.append("showName", "true");

  const res = await fetch(PUMP_IPFS_URL, { method: "POST", body: form });
  const bodyText = await res.text();

  if (!res.ok) {
    throw new Error(
      `pump.fun IPFS upload failed (${res.status}): ${bodyText.slice(0, 400)}`,
    );
  }

  let json: { metadataUri?: string; metadata?: Record<string, unknown> };
  try {
    json = JSON.parse(bodyText) as typeof json;
  } catch {
    throw new Error(`pump.fun IPFS returned non-JSON: ${bodyText.slice(0, 200)}`);
  }

  const metadataUri = json.metadataUri?.trim();
  if (!metadataUri) {
    throw new Error(
      `pump.fun IPFS response missing metadataUri: ${bodyText.slice(0, 400)}`,
    );
  }

  return {
    metadataUri,
    metadata: json.metadata ?? {
      name: input.name,
      symbol: input.symbol,
      description,
      website: input.website,
      twitter: TWITTER_URL,
    },
  };
}

/**
 * Fallback: Pinata two-step upload when pump.fun IPFS is unavailable.
 */
export async function uploadMetadataToPinata(
  input: UploadMetadataInput,
  pinataJwt: string,
): Promise<UploadMetadataResult> {
  const description = coinDescription(input.name, input.iso);

  const imageRes = await fetch("https://uploads.pinata.cloud/v3/files", {
    method: "POST",
    headers: { Authorization: `Bearer ${pinataJwt}` },
    body: (() => {
      const fd = new FormData();
      fd.append(
        "file",
        new Blob([input.imagePng], { type: "image/png" }),
        `${input.symbol.toLowerCase()}.png`,
      );
      return fd;
    })(),
  });

  if (!imageRes.ok) {
    throw new Error(`Pinata image upload failed: ${await imageRes.text()}`);
  }

  const imageJson = (await imageRes.json()) as {
    data?: { cid?: string };
  };
  const imageCid = imageJson.data?.cid;
  if (!imageCid) throw new Error("Pinata image upload missing CID");

  const metadata = {
    name: input.name,
    symbol: input.symbol,
    description,
    image: `https://ipfs.io/ipfs/${imageCid}`,
    showName: true,
    createdOn: "https://pump.fun",
    twitter: TWITTER_URL,
    website: input.website,
  };

  const metaRes = await fetch("https://uploads.pinata.cloud/v3/files", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${pinataJwt}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      pinataContent: metadata,
      pinataMetadata: { name: `${input.symbol}-metadata.json` },
    }),
  });

  if (!metaRes.ok) {
    throw new Error(`Pinata metadata upload failed: ${await metaRes.text()}`);
  }

  const metaJson = (await metaRes.json()) as { data?: { cid?: string } };
  const metaCid = metaJson.data?.cid;
  if (!metaCid) throw new Error("Pinata metadata upload missing CID");

  return {
    metadataUri: `https://ipfs.io/ipfs/${metaCid}`,
    metadata,
  };
}

export async function uploadMetadata(
  input: UploadMetadataInput,
  pinataJwt: string | null,
): Promise<UploadMetadataResult> {
  try {
    return await uploadMetadataToPump(input);
  } catch (pumpErr) {
    if (!pinataJwt) throw pumpErr;
    console.warn(
      `  pump.fun IPFS failed, falling back to Pinata: ${pumpErr instanceof Error ? pumpErr.message : pumpErr}`,
    );
    return uploadMetadataToPinata(input, pinataJwt);
  }
}
