import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import express, { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import {
  Notification,
  InitializeRequestSchema,
  JSONRPCError,
  JSONRPCNotification,
  LoggingMessageNotification,
} from '@modelcontextprotocol/sdk/types.js';
import { log } from './utils/common/logging.js';

const SESSION_ID_HEADER_NAME = 'mcp-session-id';
const JSON_RPC = '2.0';

export class MCPStreamableHttpServer {
  server: Server;

  // to support multiple simultaneous connections
  transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};

  constructor(server: Server) {
    this.server = server;
  }

  async start() {
    log.info('Starting MCP server using Streamable HTTP transport...');

    const app = express();
    app.use(express.json());

    const router = express.Router();

    // endpoint for the client to use for sending messages
    const MCP_ENDPOINT = '/mcp';

    // handler
    router.post(MCP_ENDPOINT, async (req: Request, res: Response) => {
      await this.handlePostRequest(req, res);
    });

    // Handle GET requests for SSE streams (using built-in support from StreamableHTTP)
    router.get(MCP_ENDPOINT, async (req: Request, res: Response) => {
      await this.handleGetRequest(req, res);
    });

    app.use('/', router);

    const PORT = process.env.MCP_PORT || process.env.PORT || 3000;
    app.listen(PORT, () => {
      log.info(`MCP Streamable HTTP server running on port ${PORT}`);
      log.info(`HTTP endpoint: http://localhost:${PORT}/mcp`);
    });

    process.on('SIGINT', async () => {
      log.info('Shutting down server...');
      await this.cleanup();
      process.exit(0);
    });
  }

  async handleGetRequest(req: Request, res: Response) {
    log.info('get request received');
    // if server does not offer an SSE stream at this endpoint.
    // res.status(405).set('Allow', 'POST').send('Method Not Allowed')

    const sessionId = req.headers[SESSION_ID_HEADER_NAME] as string | undefined;
    if (!sessionId || !this.transports[sessionId]) {
      res.status(400).json(this.createErrorResponse('Bad Request: invalid session ID or method.'));
      return;
    }

    log.info(`Establishing SSE stream for session ${sessionId}`);
    const transport = this.transports[sessionId];
    await transport.handleRequest(req, res);
    await this.streamMessages(transport);

    return;
  }

  async handlePostRequest(req: Request, res: Response) {
    const sessionId = req.headers[SESSION_ID_HEADER_NAME] as string | undefined;

    log.info('post request received');
    log.info('body: ', req.body);

    let transport: StreamableHTTPServerTransport;

    try {
      // reuse existing transport
      if (sessionId && this.transports[sessionId]) {
        transport = this.transports[sessionId];
        await transport.handleRequest(req, res, req.body);
        return;
      }

      // create new transport
      if (!sessionId && this.isInitializeRequest(req.body)) {
        const transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => randomUUID(),
          // for stateless mode:
          // sessionIdGenerator: () => undefined
        });

        await this.server.connect(transport);
        await transport.handleRequest(req, res, req.body);

        // session ID will only be available (if in not Stateless-Mode)
        // after handling the first request
        const sessionId = transport.sessionId;
        if (sessionId) {
          this.transports[sessionId] = transport;
        }

        return;
      }

      res.status(400).json(this.createErrorResponse('Bad Request: invalid session ID or method.'));
      return;
    } catch (error) {
      log.error(`Error handling MCP request: [${error}]`);
      res.status(500).json(this.createErrorResponse('Internal server error.'));
      return;
    }
  }

  // send message streaming message every second
  // cannot use server.sendLoggingMessage because we have can have multiple transports
  private async streamMessages(transport: StreamableHTTPServerTransport) {
    try {
      // based on LoggingMessageNotificationSchema to trigger setNotificationHandler on client
      const message: LoggingMessageNotification = {
        method: 'notifications/message',
        params: { level: 'info', data: 'SSE Connection established' },
      };

      this.sendNotification(transport, message);

      let messageCount = 0;

      const interval = setInterval(async () => {
        messageCount++;

        const data = `Message ${messageCount} at ${new Date().toISOString()}`;

        const message: LoggingMessageNotification = {
          method: 'notifications/message',
          params: { level: 'info', data: data },
        };

        try {
          this.sendNotification(transport, message);

          log.info(`Sent: ${data}`);

          if (messageCount === 2) {
            clearInterval(interval);

            const message: LoggingMessageNotification = {
              method: 'notifications/message',
              params: { level: 'info', data: 'Streaming complete!' },
            };

            this.sendNotification(transport, message);

            log.info('Stream completed');
          }
        } catch (error) {
          log.error(`Error sending message: [${error}]`);
          clearInterval(interval);
        }
      }, 1000);
    } catch (error) {
      log.error(`Error sending message: [${error}]`);
    }
  }

  async cleanup() {
    await this.server.close();
  }

  private async sendNotification(
    transport: StreamableHTTPServerTransport,
    notification: Notification
  ) {
    const rpcNotification: JSONRPCNotification = {
      ...notification,
      jsonrpc: JSON_RPC,
    };
    await transport.send(rpcNotification);
  }

  private createErrorResponse(message: string): JSONRPCError {
    return {
      jsonrpc: JSON_RPC,
      error: {
        code: -32000,
        message: message,
      },
      id: randomUUID(),
    };
  }

  private isInitializeRequest(body: any): boolean {
    const isInitial = (data: any) => {
      const result = InitializeRequestSchema.safeParse(data);
      return result.success;
    };
    if (Array.isArray(body)) {
      return body.some((request) => isInitial(request));
    }
    return isInitial(body);
  }

  async stop() {
    log.info('Stopping MCP Streamable HTTP server...');
    await this.cleanup();
  }
}
