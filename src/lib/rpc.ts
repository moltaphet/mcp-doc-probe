export const DEFAULT_RPC = "https://atlantic.dplabs-internal.com";
export const TEST_ADDRESS = "0x0000000000000000000000000000000000000000";
export const rpcRequests = {
  eth_chainId: [],
  eth_blockNumber: [],
  eth_gasPrice: [],
  eth_getProof: [TEST_ADDRESS, ["0x0"], "latest"]
} as const;

export function buildRpcPayload(method: keyof typeof rpcRequests, params: unknown[] = [...rpcRequests[method]]) {
  return { jsonrpc: "2.0", method, params, id: Date.now() };
}
