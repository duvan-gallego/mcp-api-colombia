# Api Colombia MCP Server

Model Context Protocol (MCP) is a standardized protocol for managing context between large language models (LLMs) and external systems. This repository provides an MCP Server for api-colombia, allowing you to use the API using natural language.

## Getting started

After cloning the project, install all the dependencies

```
pnpm install
```

Once all the dependencies are installed, generate the [api-colombia](https://api-colombia.com/) client

```
pnpm prepare
```

Test it by using the MCP Inspector

```
npx @modelcontextprotocol/inspector node dist/index.js
```

Note: If you make changes to your code, remember to rebuild:

```
pnpm build
```
