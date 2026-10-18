import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
const allowed = new Set(["eth_chainId", "eth_blockNumber", "eth_gasPrice", "eth_getProof"]);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const endpoint = typeof body.endpoint === "string" ? new URL(body.endpoint) : null;
    const method = body.method;
    if (!endpoint || endpoint.protocol !== "https:") return NextResponse.json({ error: "RPC endpoint must be an HTTPS URL." }, { status: 400 });
    if (!allowed.has(method)) return NextResponse.json({ error: "This method is not enabled in the verifier." }, { status: 400 });
    const params = Array.isArray(body.params) ? body.params : [];
    const upstream = await fetch(endpoint.toString(), {
      method: "POST", headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }), signal: AbortSignal.timeout(12000), cache: "no-store"
    });
    const raw = await upstream.text();
    let result: unknown;
    try { result = JSON.parse(raw); } catch { result = { raw }; }
    return NextResponse.json({ endpoint: endpoint.toString(), status: upstream.status, response: result }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "RPC request failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
