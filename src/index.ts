#!/usr/bin/env node

import { log } from './utils/common/logging.js';
import { MCPStdioServer } from './stdio-server.js';
import { MCPStreamableHttpServer } from './streamablehttp-server.js';
import { createServer } from './create-server.js';

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
  // Determine transport type
  const transportType =
    process.env.MCP_TRANSPORT || (process.argv.includes('--stdio') ? 'stdio' : 'sse');

  const mcpServer =
    transportType === 'sse'
      ? new MCPStreamableHttpServer(createServer)
      : new MCPStdioServer(await createServer());
  await mcpServer.start();
}

await main();
