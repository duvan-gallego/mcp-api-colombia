#!/usr/bin/env node

import { log } from './utils/common/logging.js';
import { MCPStdioServer } from './stdio-server.js';
import { MCPStreamableHttpServer } from './streamablehttp-server.js';
import { createServer } from './create-server.js';
import { resolveTransport } from './utils/transport.js';

process.on('uncaughtException', (error) => {
  log.error('Uncaught exception', { error: String(error) });
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  log.error('Unhandled rejection', { error: String(error) });
  process.exit(1);
});

export async function main() {
  log.info('Starting MCP server...');
  const transport = resolveTransport(process.env.MCP_TRANSPORT, process.argv);
  if (transport.usesLegacyAlias) {
    log.warn('MCP_TRANSPORT=sse is deprecated; use MCP_TRANSPORT=streamable-http instead.');
  }

  const mcpServer =
    transport.type === 'streamable-http'
      ? new MCPStreamableHttpServer(createServer)
      : new MCPStdioServer(await createServer());
  await mcpServer.start();
}

await main();
