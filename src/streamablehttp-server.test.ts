import { Server as HttpServer } from 'node:http';
import { AddressInfo } from 'node:net';
import { McpServer } from '@modelcontextprotocol/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createServer } from './create-server.js';
import { MCPStreamableHttpServer, isAllowedOrigin } from './streamablehttp-server.js';

const httpServers: HttpServer[] = [];

async function startTestServer(serverFactory: () => Promise<McpServer> = vi.fn()): Promise<string> {
  const app = new MCPStreamableHttpServer(serverFactory).createApp();
  const httpServer = app.listen(0, '127.0.0.1');
  httpServers.push(httpServer);
  await new Promise<void>((resolve) => httpServer.once('listening', resolve));

  const { port } = httpServer.address() as AddressInfo;
  return `http://127.0.0.1:${port}`;
}

async function readMcpResponse(response: Response): Promise<unknown> {
  const body = await response.text();
  const data = response.headers.get('content-type')?.includes('text/event-stream')
    ? body
        .split('\n')
        .find((line) => line.startsWith('data: '))
        ?.slice('data: '.length)
    : body;

  if (!data) {
    throw new Error('MCP response did not contain a JSON-RPC message.');
  }

  return JSON.parse(data);
}

afterEach(async () => {
  await Promise.all(
    httpServers
      .splice(0)
      .map((httpServer) => new Promise<void>((resolve) => httpServer.close(() => resolve())))
  );
  delete process.env.MCP_ALLOWED_ORIGINS;
});

describe('Streamable HTTP security', () => {
  it('allows requests without an Origin header and local browser origins', () => {
    expect(isAllowedOrigin(undefined)).toBe(true);
    expect(isAllowedOrigin('http://localhost:5173')).toBe(true);
    expect(isAllowedOrigin('https://127.0.0.1:3000')).toBe(true);
  });

  it('rejects malformed and non-local origins by default', () => {
    expect(isAllowedOrigin('not a url')).toBe(false);
    expect(isAllowedOrigin('https://malicious.example')).toBe(false);
  });

  it('uses an explicit origin allowlist when configured', () => {
    process.env.MCP_ALLOWED_ORIGINS = 'https://app.example, https://admin.example';

    expect(isAllowedOrigin('https://app.example')).toBe(true);
    expect(isAllowedOrigin('http://localhost:3000')).toBe(false);
  });

  it('does not expose a standalone SSE stream', async () => {
    const url = await startTestServer();
    const response = await fetch(`${url}/mcp`);

    expect(response.status).toBe(405);
    expect(response.headers.get('allow')).toBe('POST, DELETE');
  });

  it('rejects requests from disallowed origins before creating a session', async () => {
    const url = await startTestServer();
    const response = await fetch(`${url}/mcp`, {
      method: 'POST',
      headers: { Origin: 'https://malicious.example', 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({
      error: { message: 'Forbidden: invalid Origin header.' },
    });
  });

  it('rejects oversized request bodies', async () => {
    const url = await startTestServer();
    const response = await fetch(`${url}/mcp`, {
      method: 'POST',
      headers: {
        Accept: 'application/json, text/event-stream',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: 'x'.repeat(1024 * 1024) }),
    });

    expect(response.status).toBe(413);
    await expect(response.json()).resolves.toMatchObject({
      error: { message: 'Payload too large.' },
    });
  });

  it('initializes a v2 session and exposes the registered tools', async () => {
    const url = await startTestServer(createServer);
    const initializeResponse = await fetch(`${url}/mcp`, {
      method: 'POST',
      headers: {
        Accept: 'application/json, text/event-stream',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2025-11-25',
          capabilities: {},
          clientInfo: { name: 'test-client', version: '1.0.0' },
        },
      }),
    });

    expect(initializeResponse.status).toBe(200);
    const sessionId = initializeResponse.headers.get('mcp-session-id');
    expect(sessionId).toBeTruthy();
    await expect(readMcpResponse(initializeResponse)).resolves.toMatchObject({
      result: { protocolVersion: '2025-11-25', capabilities: { tools: {} } },
    });

    const listToolsResponse = await fetch(`${url}/mcp`, {
      method: 'POST',
      headers: {
        Accept: 'application/json, text/event-stream',
        'Content-Type': 'application/json',
        'mcp-session-id': sessionId!,
      },
      body: JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} }),
    });

    expect(listToolsResponse.status).toBe(200);
    await expect(readMcpResponse(listToolsResponse)).resolves.toMatchObject({
      result: {
        tools: expect.arrayContaining([
          expect.objectContaining({
            name: 'get-country-colombia',
            outputSchema: expect.objectContaining({
              properties: expect.objectContaining({ data: expect.any(Object) }),
              required: ['data'],
            }),
          }),
        ]),
      },
    });
  });
});
