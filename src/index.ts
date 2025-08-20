#!/usr/bin/env node

import { log } from './utils/helpers.js';
import { MCPStdioServer } from './stdio-server.js';
import { MCPStreamableHttpServer } from './streamablehttp-server.js';
import { createServer } from './create-server.js';

process.on('uncaughtException', (error) => {
  log('Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  log('Unhandled rejection:', error);
  process.exit(1);
});

export async function main() {
  log('Starting MCP server...');
  // Determine transport type
  const transportType =
    process.env.MCP_TRANSPORT || (process.argv.includes('--stdio') ? 'stdio' : 'sse');

  const server = await createServer();

  const mcpServer =
    transportType === 'sse' ? new MCPStreamableHttpServer(server) : new MCPStdioServer(server);
  await mcpServer.start();
}

await main();
