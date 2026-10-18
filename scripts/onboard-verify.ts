import { DOC_FALLBACK, DOCS_ROOT, LLMS_URL, gaps, onboardingSteps } from "../src/lib/audit-data";
import { DEFAULT_RPC, rpcRequests } from "../src/lib/rpc";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

// Keep the CLI convenient without requiring a dotenv dependency.
for (const file of [".env.local", ".env"]) {
  const path = resolve(process.cwd(), file);
  if (!existsSync(path)) continue;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (match && process.env[match[1]] === undefined) process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, "$2");
  }
}

const rpcUrl = process.env.PHAROS_RPC_URL || DEFAULT_RPC;
const toHex = (value: unknown) => typeof value === "string" ? value : "";

async function rpc(method: string, params: unknown[] = []) {
  const response = await fetch(rpcUrl, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }), signal: AbortSignal.timeout(12000) });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body.error) throw new Error(`${method} failed: ${JSON.stringify(body.error ?? body)}`);
  return body;
}

async function main() {
  console.log("╭────────────────────────────────────────────────────────────────╮");
  console.log("│ PHAROS DOCS MCP ONBOARDING AUDIT · TASK 01                     │");
  console.log("╰────────────────────────────────────────────────────────────────╯\n");
  console.log("01 · ONBOARDING LOG");
  onboardingSteps.forEach((step, i) => {
    console.log(`  ${String(i + 1).padStart(2, "0")}. ${step.title}`);
    console.log(`      QUERY: ${step.query}`);
    console.log(`      DOCS:  ${step.docs.join(" · ")}`);
    console.log(`      EXPECTED: ${step.answer}\n`);
  });
  console.log("02 · FOUR BREAKDOWNS & EXACT QUERIES");
  gaps.forEach((gap) => console.log(`  ${gap.id} ${gap.title}\n      QUERY: ${gap.query}\n      OUTPUT: ${gap.behavior}\n`));
  console.log("03 · PATCHES");
  gaps.forEach((gap) => console.log(`\n--- ${gap.id} · WHAT THE DOCS SHOULD HAVE SAID ---\n${gap.patch}\n`));
  console.log("\n04 · DOC INDEX");
  let docs = DOC_FALLBACK;
  let indexSource = "curated local fallback";
  try {
    const response = await fetch(LLMS_URL, { signal: AbortSignal.timeout(6500) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const raw = await response.text();
    const links = [...raw.matchAll(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g)];
    if (links.length === 0) throw new Error("No links parsed from index");
    docs = links.map((match) => ({ title: match[1], url: match[2].replace(/\.md$/, ""), section: "Live index", category: "Live index" }));
    indexSource = "https://docs.pharos.xyz/llms.txt";
  } catch (error) { console.log(`  Live index unavailable (${error instanceof Error ? error.message : String(error)}); using curated fallback.`); }
  console.log(`  Source: ${indexSource}`);
  console.log(`  Indexed ${docs.length} documentation endpoints.`);
  console.log(`  Docs root: ${DOCS_ROOT}`);

  console.log("\n04 · LIVE PHAROS RPC");
  console.log(`  Endpoint: ${rpcUrl}`);
  const checks: Record<string, unknown> = {};
  for (const method of ["eth_chainId", "eth_blockNumber", "eth_gasPrice"] as const) {
    const result = await rpc(method, [...rpcRequests[method]]);
    checks[method] = result.result;
    console.log(`  ${method}: ${toHex(result.result)}`);
  }
  const expectedChain = BigInt(688689);
  if (typeof checks.eth_chainId === "string" && BigInt(checks.eth_chainId) !== expectedChain) {
    console.log(`  NOTE: endpoint chain ID differs from Atlantic Testnet (expected 0x${expectedChain.toString(16)}).`);
  } else {
    console.log("  Atlantic chain ID matches (688689 / 0xa8231).");
  }
  const proofParams = ["0x0000000000000000000000000000000000000000", ["0x0"], "latest"];
  console.log(`  eth_getProof payload: ${JSON.stringify({ jsonrpc: "2.0", method: "eth_getProof", params: proofParams, id: 1 })}`);
  try {
    const proof = await rpc("eth_getProof", proofParams);
    console.log(`  eth_getProof: returned response (${JSON.stringify(proof.result).slice(0, 500)}${JSON.stringify(proof.result).length > 500 ? "…" : ""})`);
    console.log("  Reminder: retrieval is not cryptographic proof verification; verify against a trusted state root.");
  } catch (error) { console.log(`  eth_getProof tester: ${error instanceof Error ? error.message : String(error)}`); }
  console.log("\nReference: https://docs.pharos.xyz/ · https://docs.pharos.xyz/llms.txt · https://ai.pharos.xyz");
}

main().catch((error) => { console.error(`\nRPC audit failed: ${error instanceof Error ? error.message : String(error)}`); process.exitCode = 1; });
