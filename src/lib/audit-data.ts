export type DocEntry = { section: string; title: string; url: string; category: string };

export const DOCS_ROOT = "https://docs.pharos.xyz/";
export const LLMS_URL = "https://docs.pharos.xyz/llms.txt";
export const AI_WORKSPACE = "https://ai.pharos.xyz";

// Curated fallback mirrors the onboarding areas required by the reviewer. Live llms.txt is always preferred.
export const DOC_FALLBACK: DocEntry[] = [
  ["Getting Started","Network","getting-started/network"],
  ["Getting Started","Get PROS","getting-started/get-pros"],
  ["Getting Started","Gas","getting-started/gas"],
  ["Getting Started","Canonical Contracts","getting-started/canonical-contracts"],
  ["Getting Started","Token Registry","getting-started/token-registry"],
  ["Getting Started","Gas Model","getting-started/gas-model"],
  ["Getting Started","FAQs","getting-started/faqs"],
  ["Tooling & Infrastructure","Block Explorer","tooling-and-infrastructure/block-explorer"],
  ["Tooling & Infrastructure","RPC Infrastructure","tooling-and-infrastructure/rpc-infrastructure"],
  ["Tooling & Infrastructure","Pharos MCP","tooling-and-infrastructure/pharos-mcp"],
  ["Tooling & Infrastructure","Indexer","tooling-and-infrastructure/indexer"],
  ["Tooling & Infrastructure","Oracle","tooling-and-infrastructure/oracle"],
  ["Tooling & Infrastructure","Cross Chain Infrastructure","tooling-and-infrastructure/cross-chain-infrastructure"],
  ["Tooling & Infrastructure","Wallet","tooling-and-infrastructure/wallet"],
  ["Tooling & Infrastructure","Pharos Skill Engine","tooling-and-infrastructure/pharos-skill-engine"],
  ["Tooling & Infrastructure","Anvita Flow","tooling-and-infrastructure/anvita-flow"],
  ["API & SDK","JSON-RPC API Methods","api-and-sdk/json-rpc-methods"],
  ["API & SDK","eth_getProof — Storage State Verification (SPV)","api-and-sdk/spv-proof-theory-explanation"],
  ["Developer Guide","Foundry","developer-guide/foundry"],
  ["Developer Guide","Hardhat","developer-guide/hardhat"],
  ["Developer Guide","Rust","developer-guide/rust"],
  ["Developer Guide","Interoperability","developer-guide/interoperability"],
  ["Developer Guide","x402","developer-guide/x402"]
].map(([category, title, section]) => ({ category, title, section, url: `${DOCS_ROOT}${section}` }));

export const architecture = [
  { name: "L1-Base", note: "Data availability + hardware acceleration" },
  { name: "L1-Core", note: "Parallel execution + sub-second finality" },
  { name: "L1-Extension", note: "Special Processing Networks (SPNs)" },
];

export type Gap = { id: string; title: string; query: string; behavior: string; diagnosis: string; patch: string; category: string };
export const gaps: Gap[] = [
  {
    id: "GAP-01", title: "Compound retrieval stalls", category: "Orchestration", query: "Using ONLY the Developer Docs MCP, walk me through the complete developer onboarding for Pharos Network: 1. Testnet/Devnet RPC URLs & Chain ID... 2. Canonical smart contracts... 3. Foundry/Hardhat & eth_getProof... 4. Chain MCP & SkillEngine setup...",
    behavior: "Reviewer-supplied observation: the Docs MCP agent remains in “Thinking…” while a compound request fans out across multiple pages. This dashboard has no live Docs MCP connection, so the behavior is recorded as a supplied scenario, not a reproduced trace.",
    diagnosis: "A single request asks one retrieval pass to cover four unrelated doc groups, increasing fan-out and making completion behavior hard to inspect.",
    patch: `# Pharos onboarding retrieval plan\n\nRun each question independently and return its source URL before continuing.\n\n1. Network: Atlantic Testnet RPC URL and chain ID.\n2. Contracts: canonical contract addresses and verified ABI links.\n3. Toolchain: Foundry/Hardhat setup and eth_getProof parameters.\n4. Agents: supported Pharos MCP endpoint, transport, and tool schemas.\n\nReturn a partial result when one section is unavailable; never keep the whole onboarding response pending.`
  },
  {
    id: "GAP-02", title: "External MCP setup is underspecified", category: "Agent tooling", query: "How do I connect and use Pharos Chain MCP and SkillEngine in an external IDE or local TypeScript agent? Provide the exact MCP endpoint URL and tool input/output JSON schemas.",
    behavior: "Reviewer-supplied observation: response gives high-level architecture, without a copy-pasteable mcpServers configuration or input/output schemas. Not independently executed in this workspace.",
    diagnosis: "The onboarding page needs to distinguish supported server endpoints from conceptual products and publish exact transport, auth, tool names, and JSON Schema.",
    patch: `# MCP connection\n\n> Illustrative schema only. Pharos must publish the supported endpoint and transport before this configuration is advertised as working.\n\n\`\`\`json\n{\n  "mcpServers": {\n    "pharos-docs": {\n      "url": "https://ai.pharos.xyz/mcp",\n      "transport": "streamable-http"\n    }\n  }\n}\n\`\`\`\n\n## Example tool contract\n\n\`\`\`json\n{\n  "name": "search_pharos_docs",\n  "inputSchema": {\n    "type": "object",\n    "required": ["query"],\n    "properties": { "query": { "type": "string", "minLength": 1 }, "section": { "type": "string" } },\n    "additionalProperties": false\n  },\n  "outputSchema": {\n    "type": "object",\n    "required": ["answer", "sources"],\n    "properties": { "answer": { "type": "string" }, "sources": { "type": "array", "items": { "type": "string", "format": "uri" } } }\n  }\n}\n\`\`\`\n\nPublish verified endpoint, transport, auth, tool names, schemas, and one working request/response example.`
  },
  {
    id: "GAP-03", title: "Contract references are not a registry", category: "Machine-readable data", query: "List all deployed addresses and ABIs in Canonical Contracts and Token Registry on Pharos.",
    behavior: "Reviewer-supplied observation: answer is conceptual prose or incomplete snippets rather than one unified registry with verified minimal ABIs. The addresses below are deliberately not fabricated.",
    diagnosis: "A versioned, chain-scoped registry should publish address, deployment block, verification source, ABI, and last-checked date. A missing value must be explicit.",
    patch: `# Contract registry\n\n\`\`\`json\n{\n  "schemaVersion": "1.0.0",\n  "network": "pharos-pacific",\n  "chainId": 1672,\n  "contracts": {\n    "WPROS": { "address": null, "abi": [], "verified": false, "source": null },\n    "Multicall3": { "address": null, "abi": [], "verified": false, "source": null },\n    "TokenRegistry": { "address": null, "abi": [], "verified": false, "source": null }\n  }\n}\n\`\`\`\n\nPopulate each address and minimal ABI from the verified explorer deployment. Keep null until independently verified.`
  },
  {
    id: "GAP-04", title: "SPV and gas docs stop before runnable code", category: "Runnable examples", query: "Show a runnable TypeScript/viem or Foundry script for Pharos Gas Model estimation and eth_getProof storage slot verification.",
    behavior: "Reviewer-supplied observation: the answer returns a raw eth_getProof JSON-RPC specification but no client-side proof verification or parallel gas configuration example. Not independently executed in this workspace.",
    diagnosis: "The reference needs a minimal, runnable request and explicit distinction between fetching a proof and cryptographically verifying it against a trusted state root.",
    patch: `import { createPublicClient, defineChain, http, type Address } from "viem";\n\nconst pharos = defineChain({\n  id: 688689, name: "Pharos Atlantic", nativeCurrency: { name: "PHRS", symbol: "PHRS", decimals: 18 },\n  rpcUrls: { default: { http: [process.env.PHAROS_RPC_URL ?? "https://atlantic.dplabs-internal.com"] } }\n});\nconst client = createPublicClient({ chain: pharos, transport: http() });\nconst [block, gasPrice] = await Promise.all([client.getBlockNumber(), client.getGasPrice()]);\nconsole.log({ block: block.toString(), gasPriceWei: gasPrice.toString() });\n\n// Estimate independent transactions concurrently; this is RPC concurrency, not a protocol gas knob.\nconst account = "0x0000000000000000000000000000000000000000" as Address;\nconst estimates = await Promise.all([0, 1].map(() => client.estimateGas({ account, to: account, value: 0n })));\nconsole.log("gas estimates:", estimates.map(String));\n\nconst proof = await client.request({ method: "eth_getProof", params: [account, ["0x0"], "latest"] } as never);\nconsole.dir(proof, { depth: null });\n// Fetching a proof is not verification: verify account/storage trie proofs against a trusted stateRoot with a maintained MPT library.`
  }
];

export const onboardingSteps = [
  { title: "Choose a network", query: "Which Pharos network should I use for development, and what are its RPC URL and chain ID?", docs: ["Network", "RPC Infrastructure"], answer: "Start with Atlantic Testnet. Configure its RPC URL and chain ID from the current Network/RPC pages; the default runner targets https://atlantic.dplabs-internal.com and checks the returned chain ID live." },
  { title: "Fund and understand fees", query: "How do I get testnet PROS/PHRS, and how does gas estimation work on Pharos?", docs: ["Get PROS", "Gas", "Gas Model", "FAQs"], answer: "Follow the official faucet and gas pages for current funding and fee rules. Use eth_gasPrice and eth_estimateGas against your selected RPC; the CLI reports live values without assuming a fixed fee." },
  { title: "Find verified contracts", query: "Where are the canonical contracts and token addresses for my selected Pharos network?", docs: ["Canonical Contracts", "Token Registry"], answer: "Use the network-scoped official registry and verify each address on the linked block explorer. This auditor intentionally leaves addresses unfilled until an official source can be verified." },
  { title: "Install your toolchain", query: "How do I configure Foundry or Hardhat for Pharos and call eth_getProof?", docs: ["Foundry", "Hardhat", "JSON-RPC API Methods", "eth_getProof — Storage State Verification (SPV)"], answer: "Use the SDK guide for network configuration and the JSON-RPC reference for method parameters. eth_getProof returns proof material; applications must still verify it against a trusted state root." },
  { title: "Connect data and agents", query: "Which Pharos MCP, indexer, oracle, wallet, and Skill Engine endpoints are supported?", docs: ["Pharos MCP", "Indexer", "Oracle", "Wallet", "Pharos Skill Engine", "Anvita Flow"], answer: "Review each tooling guide for its published endpoint and auth requirements. Do not assume a product page implies a public MCP endpoint; ask for a maintained config and tool schemas." }
];
