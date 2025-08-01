import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { log } from './utils/helpers.js';

export class MCPStdioServer {
  server: Server;

  constructor(server: Server) {
    this.server = server;
  }

  async start() {
    log('Starting MCP server using Stdio transport...');

    try {
      const transport = new StdioServerTransport();
      log('StdioServerTransport created');
      await this.server.connect(transport);
      log('Server connected and running');
    } catch (error) {
      log('Fatal error:', error);
      process.exit(1);
    }
  }
}
