export type TransportType = 'stdio' | 'streamable-http';

export function resolveTransport(
  configuredTransport: string | undefined,
  arguments_: readonly string[]
): TransportType {
  const requestedTransport =
    configuredTransport ?? (arguments_.includes('--stdio') ? 'stdio' : 'streamable-http');

  if (requestedTransport === 'stdio' || requestedTransport === 'streamable-http') {
    return requestedTransport;
  }

  throw new Error(
    `Unsupported MCP_TRANSPORT value: ${requestedTransport}. Use "stdio" or "streamable-http".`
  );
}
