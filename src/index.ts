#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { version } from "./utils/version.js";
import { log } from "./utils/helpers.js";
import { REGION_HANDLERS, REGION_TOOLS } from "./tools/region/index.js";


process.on("uncaughtException", (error) => {
  log("Uncaught exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (error) => {
  log("Unhandled rejection:", error);
  process.exit(1);
});


const ALL_TOOLS = [
  ...REGION_TOOLS,
];

const ALL_HANDLERS = {
  ...REGION_HANDLERS,
};

const server = new Server(
  { name: "mcp-api-colombia", version },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  log("Received list tools request");
  return { tools: ALL_TOOLS };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const toolName = request.params.name;
  log("Received tool call:", toolName);

  try {
    const handler = ALL_HANDLERS[toolName];
    if (!handler) {
      throw new Error(`Unknown tool: ${toolName}`);
    }
    return await handler(request);
  } catch (error) {
    log("Error handling tool call:", error);
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});


export async function main() {
  log("Starting server...");

  try {
    const transport = new StdioServerTransport();
    log("Created transport");
    await server.connect(transport);
    log("Server connected and running");
  } catch (error) {
    log("Fatal error:", error);
    process.exit(1);
  }
}

await main();