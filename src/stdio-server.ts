import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { log } from './utils/common/logging.js';

export class MCPStdioServer {
  server: Server;

  constructor(server: Server) {
    this.server = server;
  }

  async start() {
    log.info('Starting MCP server using Stdio transport...');

    try {
      const transport = new StdioServerTransport();
      log.debug('StdioServerTransport created');
      await this.server.connect(transport);
      log.info('Server connected and running');
    } catch (error) {
      log.error('Fatal error starting stdio transport', { error: String(error) });
      process.exit(1);
    }
  }
}
