export type TransportType = 'stdio' | 'streamable-http';

export type TransportSelection = {
  type: TransportType;
  usesLegacyAlias: boolean;
};

export function resolveTransport(
  configuredTransport: string | undefined,
  arguments_: readonly string[]
): TransportSelection {
  const requestedTransport =
    configuredTransport ?? (arguments_.includes('--stdio') ? 'stdio' : 'streamable-http');

  if (requestedTransport === 'stdio' || requestedTransport === 'streamable-http') {
    return { type: requestedTransport, usesLegacyAlias: false };
  }

  if (requestedTransport === 'sse') {
    return { type: 'streamable-http', usesLegacyAlias: true };
  }

  throw new Error(
    `Unsupported MCP_TRANSPORT value: ${requestedTransport}. Use "stdio" or "streamable-http".`
  );
}
