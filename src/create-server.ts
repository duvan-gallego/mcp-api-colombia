import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { version } from './utils/version.js';
import { log } from './utils/helpers.js';
import { COUNTRY_TOOLS, DEPARTMENT_TOOLS, REGION_TOOLS } from './tools/tools.js';
import { COUNTRY_HANDLERS, DEPARTMENT_HANDLERS, REGION_HANDLERS } from './tools/tool-handlers.js';
import { CITY_HANDLERS, CITY_TOOLS } from './tools/definitions/city.js';
import { PRESIDENT_HANDLERS, PRESIDENT_TOOLS } from './tools/definitions/president.js';
import {
  TOURISTIC_ATTRACTION_HANDLERS,
  TOURISTIC_ATTRACTION_TOOLS,
} from './tools/definitions/touristic-attractions.js';
import {
  CATEGORY_NATURAL_AREA_HANDLERS,
  CATEGORY_NATURAL_AREA_TOOLS,
} from './tools/definitions/category-natural-area.js';
import { NATURAL_AREA_HANDLERS, NATURAL_AREA_TOOLS } from './tools/definitions/natural-area.js';
import { MAP_HANDLERS, MAP_TOOLS } from './tools/definitions/map.js';

export const createServer = async (): Promise<Server> => {
  const ALL_TOOLS = [
    ...COUNTRY_TOOLS,
    ...REGION_TOOLS,
    ...DEPARTMENT_TOOLS,
    ...CITY_TOOLS,
    ...PRESIDENT_TOOLS,
    ...TOURISTIC_ATTRACTION_TOOLS,
    ...CATEGORY_NATURAL_AREA_TOOLS,
    ...NATURAL_AREA_TOOLS,
    ...MAP_TOOLS,
  ];

  const ALL_HANDLERS = {
    ...COUNTRY_HANDLERS,
    ...REGION_HANDLERS,
    ...DEPARTMENT_HANDLERS,
    ...CITY_HANDLERS,
    ...PRESIDENT_HANDLERS,
    ...TOURISTIC_ATTRACTION_HANDLERS,
    ...CATEGORY_NATURAL_AREA_HANDLERS,
    ...NATURAL_AREA_HANDLERS,
    ...MAP_HANDLERS,
  };

  const server = new Server({ name: 'mcp-api-colombia', version }, { capabilities: { tools: {} } });

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    log('Received list tools request');
    return { tools: ALL_TOOLS };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const toolName = request.params.name;
    log('Received tool call:', toolName);

    try {
      const handler = ALL_HANDLERS[toolName];
      if (!handler) {
        throw new Error(`Unknown tool: ${toolName}`);
      }
      return await handler(request);
    } catch (error) {
      log('Error handling tool call:', error);
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  });

  return server;
};
