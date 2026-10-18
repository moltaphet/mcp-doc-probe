# Pharos Docs MCP Onboarding Auditor

**Pharos Agent Arena · Season of AI · Task #1: Docs MCP Onboarding · EASY · 50 PTS**

A reviewer-facing web dashboard and CLI that turn the Pharos developer onboarding journey into a traceable audit. It indexes the official docs, presents four concrete Docs MCP failure scenarios with exact queries and suggested patches, decomposes compound asks into atomic section queries, and makes live JSON-RPC requests against a configurable Pharos endpoint.

> The four failure descriptions below are the scenarios supplied in the task brief. This project does not claim to have connected to or reproduced a Docs MCP session. The “Current Docs MCP Output” column is labeled as reported behavior throughout the app. RPC results, by contrast, come from actual requests when the verifier or CLI is run.

## Official Pharos references

- Docs root: <https://docs.pharos.xyz/>
- LLM docs index: <https://docs.pharos.xyz/llms.txt>
- AI workspace: <https://ai.pharos.xyz>
- JSON-RPC methods: <https://docs.pharos.xyz/api-and-sdk/json-rpc-methods>
- Network: <https://docs.pharos.xyz/getting-started/network>
- Docs GitBook query mechanism: ask focused questions on a page’s Markdown URL using `?ask=<question>&goal=<goal>`.

The documentation describes Pharos as a **Modular & Full-stack Parallel L1**. L1-Base provides data availability and hardware acceleration; L1-Core provides a parallel high-throughput network and sub-second finality; L1-Extension supports Special Processing Networks (SPNs). The ecosystem also describes native restaking integrations including Babylon and EigenLayer, and cross-SPN interoperation. See the [official architecture overview](https://docs.pharos.xyz/) for current wording and scope.

The project’s default verifier target is Pharos Atlantic Testnet at `https://atlantic.dplabs-internal.com`, expected chain ID `688689` (`0xa8231`). The endpoint is configurable with `PHAROS_RPC_URL` or in the web panel. The runner reads `eth_chainId` and reports a mismatch rather than treating an alternate endpoint as Atlantic.

## What is included

- Interactive Next.js dashboard with the four reviewer requirements as navigable sections.
- Five-step onboarding log showing exact audit prompts, document sections, and the evidence each response should contain.
- Four reported breakdowns with exact triggering queries, current behavior, diagnosis, and patch proposals.
- Atomic Query Decomposer that splits the compound onboarding request into five independent document-section questions.
- Live RPC verifier for `eth_chainId`, `eth_blockNumber`, `eth_gasPrice`, and parameterized `eth_getProof`.
- Runtime `llms.txt` fetch and link parser with a curated local fallback covering the required Pharos documentation sections.
- CLI audit at `npm run audit`.

## Architecture

```mermaid
flowchart LR
  Reviewer[Reviewer] --> UI[Next.js audit dashboard]
  UI --> Journey[Onboarding log + gap report]
  UI --> Decomposer[Atomic Query Decomposer]
  UI --> IndexAPI[/api/docs-index]
  IndexAPI --> LLM[docs.pharos.xyz/llms.txt]
  IndexAPI --> Fallback[Curated local index]
  UI --> RPCAPI[/api/rpc]
  RPCAPI --> Pharos[Configurable Pharos JSON-RPC]
  CLI[npm run audit] --> LLM
  CLI --> Pharos
```

The RPC proxy accepts HTTPS endpoints and only forwards the four read-only methods used by this verifier. It has a 12-second timeout. The browser never receives an RPC secret from a server environment variable; use a public endpoint or a suitable deployment with provider controls.

## Requirement 01 — Step-by-step onboarding log

The dashboard presents each exact prompt alongside its target documentation sections. The CLI prints the same five steps. The expected evidence is an audit checklist, not a fabricated transcript: the app has no Docs MCP credentials or session attached.

| Step | Exact onboarding query | Pharos docs to retrieve |
| --- | --- | --- |
| 1 | `Which Pharos network should I use for development, and what are its RPC URL and chain ID?` | Network, RPC Infrastructure |
| 2 | `How do I get testnet PROS/PHRS, and how does gas estimation work on Pharos?` | Get PROS, Gas, Gas Model, FAQs |
| 3 | `Where are the canonical contracts and token addresses for my selected Pharos network?` | Canonical Contracts, Token Registry |
| 4 | `How do I configure Foundry or Hardhat for Pharos and call eth_getProof?` | Foundry, Hardhat, JSON-RPC API Methods, SPV |
| 5 | `Which Pharos MCP, indexer, oracle, wallet, and Skill Engine endpoints are supported?` | Pharos MCP, Indexer, Oracle, Wallet, Pharos Skill Engine, Anvita Flow |

Each GitBook lookup should be sent as a focused question against the relevant Markdown page with `ask` and `goal` query parameters, as described on the [official docs root](https://docs.pharos.xyz/).

## Requirement 02 — Four breakdowns and exact queries

All four requested scenarios appear in the dashboard and CLI. These are task-brief observations, presented as such.

### Gap 1 — Multi-part query orchestration timeout

**Exact query:**

> Using ONLY the Developer Docs MCP, walk me through the complete developer onboarding for Pharos Network: 1. Testnet/Devnet RPC URLs & Chain ID... 2. Canonical smart contracts... 3. Foundry/Hardhat & eth_getProof... 4. Chain MCP & SkillEngine setup...

**Reported behavior:** the Docs MCP agent stalls indefinitely in “Thinking…” while one request fans out across multiple pages.

### Gap 2 — Missing external MCP schema and tool signatures

**Exact query:**

> How do I connect and use Pharos Chain MCP and SkillEngine in an external IDE or local TypeScript agent? Provide the exact MCP endpoint URL and tool input/output JSON schemas.

**Reported behavior:** a high-level architectural description without a copy-pasteable `mcpServers` configuration and tool definitions.

### Gap 3 — Non-machine-readable contracts and token registry

**Exact query:**

> List all deployed addresses and ABIs in Canonical Contracts and Token Registry on Pharos.

**Reported behavior:** conceptual prose or incomplete snippets instead of a unified, verified JSON registry with minimal ABIs for WPROS, Multicall3, and TokenRegistry.

### Gap 4 — No runnable `eth_getProof` SPV or parallel gas example

**Exact query:**

> Show a runnable TypeScript/viem or Foundry script for Pharos Gas Model estimation and eth_getProof storage slot verification.

**Reported behavior:** the JSON-RPC method spec without runnable client-side proof verification or parallel gas configuration examples.

## Requirement 03 — Proposed documentation patches

### Patch 1 — Bound retrieval fan-out

```md
# Pharos onboarding retrieval plan

Run each question independently and return its source URL before continuing.

1. Network: Atlantic Testnet RPC URL and chain ID.
2. Contracts: canonical contract addresses and verified ABI links.
3. Toolchain: Foundry/Hardhat setup and eth_getProof parameters.
4. Agents: supported Pharos MCP endpoint, transport, and tool schemas.

Return a partial result when one section is unavailable; never keep the whole
onboarding response pending.
```

### Patch 2 — Publish an explicit MCP configuration contract

The endpoint and tool names below are illustrative schema shape. The current Pharos service URL and tool definitions must be verified by Pharos before publishing; a product name is not evidence of a working remote endpoint.

```json
{
  "mcpServers": {
    "pharos-docs": {
      "url": "https://ai.pharos.xyz/mcp",
      "transport": "streamable-http"
    }
  }
}
```

```json
{
  "name": "search_pharos_docs",
  "description": "Search official Pharos developer documentation",
  "inputSchema": {
    "type": "object",
    "required": ["query"],
    "properties": {
      "query": { "type": "string", "minLength": 1 },
      "section": { "type": "string" }
    },
    "additionalProperties": false
  },
  "outputSchema": {
    "type": "object",
    "required": ["answer", "sources"],
    "properties": {
      "answer": { "type": "string" },
      "sources": { "type": "array", "items": { "type": "string", "format": "uri" } }
    }
  }
}
```

### Patch 3 — Versioned contract registry with explicit verification state

The official addresses and ABIs are not embedded here because they could not be verified from the accessible official source content. Null entries prevent the auditor from presenting guessed addresses as facts.

```json
{
  "schemaVersion": "1.0.0",
  "network": "pharos-pacific",
  "chainId": 1672,
  "contracts": {
    "WPROS": { "address": null, "abi": [], "verified": false, "source": null },
    "Multicall3": { "address": null, "abi": [], "verified": false, "source": null },
    "TokenRegistry": { "address": null, "abi": [], "verified": false, "source": null }
  }
}
```

Pharos docs should publish one such JSON document per network, link verified explorer pages, include minimal ABIs and deployment blocks, and update the verification date on each release.

### Patch 4 — Runnable RPC request and proof-verification boundary

```ts
import { createPublicClient, defineChain, http, type Address } from "viem";

const pharosAtlantic = defineChain({
  id: 688689,
  name: "Pharos Atlantic",
  nativeCurrency: { name: "PHRS", symbol: "PHRS", decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.PHAROS_RPC_URL ?? "https://atlantic.dplabs-internal.com"] }
  }
});

const client = createPublicClient({ chain: pharosAtlantic, transport: http() });
const [block, gasPrice] = await Promise.all([client.getBlockNumber(), client.getGasPrice()]);
console.log({ block: block.toString(), gasPriceWei: gasPrice.toString() });

// Estimate independent transactions concurrently. This is RPC concurrency,
// not a Pharos protocol gas setting.
const account = "0x0000000000000000000000000000000000000000" as Address;
const estimates = await Promise.all([
  client.estimateGas({ account, to: account, value: 0n }),
  client.estimateGas({ account, to: account, value: 0n })
]);
console.log("gas estimates:", estimates.map(String));

const proof = await client.request({
  method: "eth_getProof",
  params: [account, ["0x0"], "latest"]
} as never);
console.dir(proof, { depth: null });
// A response is proof material, not a verified claim. Verify the account and
// storage trie proofs against a trusted stateRoot with a maintained MPT library.
```

The docs should give the trusted-root source and the exact verifier/library version alongside the example. The runner intentionally tests proof retrieval and payload shape; it does not claim to verify Merkle-Patricia proofs.

## Requirement 04 — Live verification runner

### Documentation index

The dashboard’s `/api/docs-index` route and CLI fetch `https://docs.pharos.xyz/llms.txt`, parse Markdown links, and index the returned endpoints. If the request fails or cannot be parsed, they use the local section list in `src/lib/audit-data.ts`. The fallback covers Getting Started, Tooling & Infrastructure, API & SDK, and Developer Guide pages requested in the task brief.

### Live JSON-RPC

The dashboard and CLI call `eth_chainId`, `eth_blockNumber`, `eth_gasPrice`, and `eth_getProof`. The UI exposes an endpoint field and editable proof address/storage key. The CLI endpoint can be set with `PHAROS_RPC_URL`. `eth_getProof` is a JSON-RPC payload builder/tester; receipt of proof fields does not itself verify them cryptographically.

### Atomic Query Decomposer

The decomposer splits a compound developer question into independent requests for network setup, funding and fees, canonical contracts, toolchain/SPV, and agent infrastructure. Each query is visible and can be selected. This is a Docs MCP simulator: it displays the exact question and expected evidence but does not claim to invoke a live Docs MCP server.

## Run locally

Requirements: Node.js 18.18+ and npm.

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. For the CLI:

```bash
npm run audit
```

Or run the requested direct command:

```bash
npx tsx scripts/onboard-verify.ts
```

Configure another HTTPS endpoint:

```bash
cp .env.example .env.local
# Set PHAROS_RPC_URL to the endpoint you want to inspect.
npm run audit
```

The CLI needs network access to the docs index and RPC endpoint. If the index cannot be fetched, it uses the curated fallback. The RPC checks report actionable errors and exit nonzero if the required chain, block, or gas RPC calls fail.

## Deploy to Vercel

Import this repository into Vercel and use the default Next.js project settings. Set `PHAROS_RPC_URL` in project environment variables if the default Atlantic endpoint should differ, then deploy. The app does not require a secret for the default public endpoint. For a keyed provider, use an endpoint intended for public browser-facing calls or add deployment-specific access controls and rate limiting before exposing the proxy.

## Notes for the Reviewer

> **Proof link:** deploy the repository to Vercel and submit the resulting URL for Task #1: Docs MCP Onboarding.
>
> **What to inspect:** Req 01 shows the step-by-step log and exact prompts; Req 02 shows four failure scenarios and triggering queries; Req 03 shows side-by-side reported output and proposed patches; Req 04 runs the atomic query decomposer, docs index fetch/fallback, and live Pharos JSON-RPC verifier.
>
> **Evidence boundary:** the gap behaviors were supplied in the task brief and are labeled as reported scenarios. The RPC response and docs-index source are live at run time. No canonical addresses are asserted without an official verified registry source.
>
> **CLI:** run `npm run audit` to print the onboarding log, all four exact gap queries and patches, index source/count, live chain ID, block number, gas price, and an `eth_getProof` request/response attempt.
# mcp-doc-probe
