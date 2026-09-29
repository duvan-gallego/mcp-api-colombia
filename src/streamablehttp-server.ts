import { randomUUID } from 'node:crypto';
import { Server as HttpServer } from 'node:http';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { InitializeRequestSchema, JSONRPCError } from '@modelcontextprotocol/sdk/types.js';
import express, { Express, NextFunction, Request, Response } from 'express';
import { log } from './utils/common/logging.js';

const MCP_ENDPOINT = '/mcp';
const SESSION_ID_HEADER_NAME = 'mcp-session-id';
const DEFAULT_PORT = 3000;
const DEFAULT_SESSION_TTL_MS = 30 * 60 * 1000;
const MAX_REQUEST_BODY_SIZE = '1mb';

type ServerFactory = () => Promise<Server>;

type McpSession = {
  server: Server;
  transport: StreamableHTTPServerTransport;
  lastAccessedAt: number;
};

function getPort(): number {
  const configuredPort = process.env.MCP_PORT || process.env.PORT;
  if (!configuredPort) {
    return DEFAULT_PORT;
  }

  const port = Number(configuredPort);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('MCP_PORT must be an integer between 1 and 65535.');
  }

  return port;
}

function getSessionTtlMs(): number {
  const configuredTtl = process.env.MCP_SESSION_TTL_MS;
  if (!configuredTtl) {
    return DEFAULT_SESSION_TTL_MS;
  }

  const ttl = Number(configuredTtl);
  if (!Number.isInteger(ttl) || ttl < 1) {
    throw new Error('MCP_SESSION_TTL_MS must be a positive integer.');
  }

  return ttl;
}

export function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) {
    return true;
  }

  const configuredOrigins = process.env.MCP_ALLOWED_ORIGINS?.split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  if (configuredOrigins?.length) {
    return configuredOrigins.includes(origin);
  }

  try {
    const url = new URL(origin);
    return (
      (url.protocol === 'http:' || url.protocol === 'https:') &&
      ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)
    );
  } catch {
    return false;
  }
}

function isPayloadTooLargeError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    error.type === 'entity.too.large'
  );
}

export class MCPStreamableHttpServer {
  private readonly sessions = new Map<string, McpSession>();
  private httpServer?: HttpServer;

  constructor(
    private readonly createServer: ServerFactory,
    private readonly sessionTtlMs = getSessionTtlMs()
  ) {}

  createApp(port = getPort()): Express {
    const app = express();

    app.use((req, res, next) => {
      const requestId = req.get('x-request-id') || randomUUID();
      res.locals.requestId = requestId;
      res.set('x-request-id', requestId);
      next();
    });
    app.use((req, res, next) => {
      if (!isAllowedOrigin(req.get('origin'))) {
        log.warn('Rejected request with invalid Origin header', {
          requestId: res.locals.requestId as string,
          origin: req.get('origin'),
        });
        this.sendError(res, 403, 'Forbidden: invalid Origin header.');
        return;
      }
      next();
    });
    app.use(express.json({ limit: MAX_REQUEST_BODY_SIZE }));

    app.post(MCP_ENDPOINT, async (req, res) => {
      await this.handlePostRequest(req, res, port);
    });
    app.delete(MCP_ENDPOINT, async (req, res) => {
      await this.handleDeleteRequest(req, res);
    });
    app.get(MCP_ENDPOINT, (_req, res) => {
      res.status(405).set('Allow', 'POST, DELETE').end();
    });
    app.use((error: unknown, _req: Request, res: Response, next: NextFunction) => {
      if (isPayloadTooLargeError(error)) {
        this.sendError(res, 413, 'Payload too large.');
        return;
      }
      next(error);
    });

    return app;
  }

  async start(): Promise<void> {
    const port = getPort();
    const app = this.createApp(port);

    log.info('Starting MCP server using Streamable HTTP transport...');
    this.httpServer = await new Promise<HttpServer>((resolve, reject) => {
      const server = app.listen(port, '127.0.0.1', () => resolve(server));
      server.once('error', reject);
    });

    log.info(`MCP Streamable HTTP server running on http://127.0.0.1:${port}${MCP_ENDPOINT}`);

    const shutdown = async () => {
      log.info('Shutting down server...');
      await this.cleanup();
      process.exit(0);
    };
    process.once('SIGINT', shutdown);
    process.once('SIGTERM', shutdown);
  }

  private async handlePostRequest(req: Request, res: Response, port: number): Promise<void> {
    const sessionId = req.get(SESSION_ID_HEADER_NAME);
    const requestId = res.locals.requestId as string;

    try {
      if (sessionId) {
        log.debug('Handling MCP session request', { requestId, sessionId });
        const session = await this.getSession(sessionId);
        if (!session) {
          this.sendError(res, 404, 'Session not found.');
          return;
        }

        await session.transport.handleRequest(req, res, req.body);
        return;
      }

      if (!this.isInitializeRequest(req.body)) {
        this.sendError(res, 400, 'Bad Request: initialize before sending requests.');
        return;
      }

      log.info('Initializing MCP session', { requestId });
      await this.createSession(req, res, port);
    } catch (error) {
      log.error('Error handling MCP request', { requestId, sessionId, error: String(error) });
      if (!res.headersSent) {
        this.sendError(res, 500, 'Internal server error.');
      }
    }
  }

  private async handleDeleteRequest(req: Request, res: Response): Promise<void> {
    const sessionId = req.get(SESSION_ID_HEADER_NAME);
    const requestId = res.locals.requestId as string;
    if (!sessionId) {
      this.sendError(res, 400, 'Bad Request: missing MCP-Session-Id header.');
      return;
    }

    const session = await this.getSession(sessionId);
    if (!session) {
      this.sendError(res, 404, 'Session not found.');
      return;
    }

    log.info('Closing MCP session', { requestId, sessionId });
    await session.transport.handleRequest(req, res);
    await this.closeSession(sessionId);
  }

  private async createSession(req: Request, res: Response, port: number): Promise<void> {
    const server = await this.createServer();
    let sessionId: string | undefined;
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: randomUUID,
      onsessioninitialized: (id) => {
        sessionId = id;
        this.sessions.set(id, { server, transport, lastAccessedAt: Date.now() });
      },
      allowedHosts: [`127.0.0.1:${port}`, `localhost:${port}`, `[::1]:${port}`],
      enableDnsRebindingProtection: true,
    });

    transport.onclose = () => {
      if (sessionId) {
        void this.closeSession(sessionId);
      }
    };

    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);

    if (!sessionId) {
      await server.close();
    }
  }

  private async getSession(sessionId: string): Promise<McpSession | undefined> {
    await this.expireSessions();
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastAccessedAt = Date.now();
    }
    return session;
  }

  private async expireSessions(): Promise<void> {
    const now = Date.now();
    const expiredSessionIds = [...this.sessions].flatMap(([sessionId, session]) =>
      now - session.lastAccessedAt >= this.sessionTtlMs ? [sessionId] : []
    );
    await Promise.all(expiredSessionIds.map((sessionId) => this.closeSession(sessionId)));
  }

  private async closeSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return;
    }

    this.sessions.delete(sessionId);
    await Promise.allSettled([session.transport.close(), session.server.close()]);
  }

  private sendError(res: Response, status: number, message: string): void {
    const error: JSONRPCError = {
      jsonrpc: '2.0',
      error: { code: -32000, message },
      id: randomUUID(),
    };
    res.status(status).json(error);
  }

  private isInitializeRequest(body: unknown): boolean {
    if (Array.isArray(body)) {
      return body.some((request) => InitializeRequestSchema.safeParse(request).success);
    }
    return InitializeRequestSchema.safeParse(body).success;
  }

  async cleanup(): Promise<void> {
    await Promise.all([...this.sessions.keys()].map((sessionId) => this.closeSession(sessionId)));
    if (this.httpServer) {
      await new Promise<void>((resolve, reject) => {
        this.httpServer?.close((error) => (error ? reject(error) : resolve()));
      });
      this.httpServer = undefined;
    }
  }

  async stop(): Promise<void> {
    log.info('Stopping MCP Streamable HTTP server...');
    await this.cleanup();
  }
}
