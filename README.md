# API Colombia MCP Server

The Model Context Protocol (MCP) is a standardized protocol for managing context between large language models (LLMs) and external systems. This repository provides an MCP Server for the [api-colombia](https://api-colombia.com/) API, allowing you to use the API through natural language. This MCP server supports the transport types STDIO and Streamable HTTP.

## API Colombia

API Colombia is a public REST API that provides information about Colombia.

## Requirements

- Node.js 20 or newer
- pnpm 10

## Quick start

Install dependencies and build the server:

```
pnpm install
pnpm build
```

Start the default Streamable HTTP server at `http://127.0.0.1:3000/mcp`:

```
pnpm start
```

For a local STDIO client instead:

```
MCP_TRANSPORT=stdio pnpm start
```

The generated API client and its OpenAPI snapshot are versioned in the repository, so `pnpm build` does not require network access.

## Runtime configuration

| Variable              | Default            | Description                                                                |
| --------------------- | ------------------ | -------------------------------------------------------------------------- |
| `MCP_TRANSPORT`       | `streamable-http`  | Use `streamable-http` for the HTTP endpoint or `stdio` for a local client. |
| `MCP_PORT`            | `3000`             | HTTP listening port. `PORT` is used when `MCP_PORT` is unset.              |
| `MCP_SESSION_TTL_MS`  | `1800000`          | Inactive Streamable HTTP session lifetime in milliseconds.                 |
| `MCP_ALLOWED_ORIGINS` | local origins only | Comma-separated browser-origin allowlist for HTTP requests.                |
| `API_TIMEOUT_MS`      | `10000`            | Timeout for each API Colombia request in milliseconds.                     |
| `API_MAX_ATTEMPTS`    | `3`                | Maximum attempts for retryable API Colombia `GET` and `HEAD` requests.     |
| `LOG_LEVEL`           | `info`             | Minimum structured log level: `error`, `warn`, `info`, or `debug`.         |

When `MCP_TRANSPORT` is unset, `--stdio` also selects STDIO:

```
pnpm start -- --stdio
```

## Connect a client

### MCP Inspector: STDIO

```
pnpm dlx @modelcontextprotocol/inspector node dist/index.js --stdio
```

Rebuild with `pnpm build` after changing the source.

### MCP Inspector: Streamable HTTP

Start the server with `pnpm start`, then launch the Inspector:

```
pnpm dlx @modelcontextprotocol/inspector
```

Connect it to `http://127.0.0.1:3000/mcp` using the Streamable HTTP transport.

### LM Studio

Build and start the HTTP server, then add this configuration in LM Studio:

```json
{
  "mcpServers": {
    "mcp-api-colombia": {
      "url": "http://localhost:3000/mcp"
    }
  }
}
```

## Deploying Streamable HTTP

The HTTP process binds to loopback (`127.0.0.1`) by design. For a remote deployment, place a TLS-terminating reverse proxy on the same host in front of `http://127.0.0.1:<MCP_PORT>/mcp`. Configure the proxy to forward an allowed loopback `Host` header, and set `MCP_ALLOWED_ORIGINS` to the exact browser origins that may connect. STDIO is intended for local process-based clients and does not use an HTTP port.

## Updating the API client

When API Colombia publishes a change you want to adopt, refresh the versioned OpenAPI snapshot and regenerate the client:

```
pnpm update:api-spec
pnpm generate:api
```

Review and commit both `openapi/api-colombia.v1.json` and `src/client/generated` with the corresponding code changes.

## License

MIT License
