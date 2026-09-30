import { McpServer, Tool } from '@modelcontextprotocol/server';
import { z } from 'zod';
import { version } from './utils/version.js';
import { log } from './utils/common/logging.js';
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
import {
  INVASIVE_SPECIE_HANDLERS,
  INVASIVE_SPECIE_TOOLS,
} from './tools/definitions/invasive-specie.js';
import {
  NATIVE_COMMUNITY_HANDLERS,
  NATIVE_COMMUNITY_TOOLS,
} from './tools/definitions/native-community.js';
import {
  INDIGENOUS_RESERVATION_HANDLERS,
  INDIGENOUS_RESERVATION_TOOLS,
} from './tools/definitions/indigenous-reservation.js';
import { AIRPORT_HANDLERS, AIRPORT_TOOLS } from './tools/definitions/airport.js';
import {
  CONSTITUTION_ARTICLE_HANDLERS,
  CONSTITUTION_ARTICLE_TOOLS,
} from './tools/definitions/constitution-article.js';
import { RADIO_HANDLERS, RADIO_TOOLS } from './tools/definitions/radio.js';
import { HOLIDAY_HANDLERS, HOLIDAY_TOOLS } from './tools/definitions/holiday.js';
import { TYPICAL_DISH_HANDLERS, TYPICAL_DISH_TOOLS } from './tools/definitions/typical-dish.js';
import {
  TRADITIONAL_FAIR_AND_FESTIVAL_HANDLERS,
  TRADITIONAL_FAIR_AND_FESTIVAL_TOOLS,
} from './tools/definitions/traditional-fair-and-festival.js';
import { normalizeTool } from './utils/common/normalize-tool-schema.js';
import { toolOutputSchema } from './utils/common/schemas.js';

export const getAllTools = () =>
  [
    ...COUNTRY_TOOLS,
    ...REGION_TOOLS,
    ...DEPARTMENT_TOOLS,
    ...CITY_TOOLS,
    ...PRESIDENT_TOOLS,
    ...TOURISTIC_ATTRACTION_TOOLS,
    ...CATEGORY_NATURAL_AREA_TOOLS,
    ...NATURAL_AREA_TOOLS,
    ...MAP_TOOLS,
    ...INVASIVE_SPECIE_TOOLS,
    ...NATIVE_COMMUNITY_TOOLS,
    ...INDIGENOUS_RESERVATION_TOOLS,
    ...AIRPORT_TOOLS,
    ...CONSTITUTION_ARTICLE_TOOLS,
    ...RADIO_TOOLS,
    ...HOLIDAY_TOOLS,
    ...TYPICAL_DISH_TOOLS,
    ...TRADITIONAL_FAIR_AND_FESTIVAL_TOOLS,
  ].map(normalizeTool);

export function createInputSchema(tool: Tool) {
  const inputSchema = tool.inputSchema as {
    properties?: Record<string, { type?: string; enum?: string[]; description?: string }>;
    required?: string[];
  };
  const required = new Set(inputSchema.required);
  const shape = Object.fromEntries(
    Object.entries(inputSchema.properties ?? {}).map(([name, property]) => {
      let schema: z.ZodType = property.enum?.length
        ? z.enum(property.enum as [string, ...string[]])
        : property.type === 'number'
          ? z.number()
          : z.string();

      if (property.description) {
        schema = schema.describe(property.description);
      }
      return [name, required.has(name) ? schema : schema.optional()];
    })
  );

  return z.object(shape).strict();
}

export const getAllHandlers = () =>
  ({
    ...COUNTRY_HANDLERS,
    ...REGION_HANDLERS,
    ...DEPARTMENT_HANDLERS,
    ...CITY_HANDLERS,
    ...PRESIDENT_HANDLERS,
    ...TOURISTIC_ATTRACTION_HANDLERS,
    ...CATEGORY_NATURAL_AREA_HANDLERS,
    ...NATURAL_AREA_HANDLERS,
    ...MAP_HANDLERS,
    ...INVASIVE_SPECIE_HANDLERS,
    ...NATIVE_COMMUNITY_HANDLERS,
    ...INDIGENOUS_RESERVATION_HANDLERS,
    ...AIRPORT_HANDLERS,
    ...CONSTITUTION_ARTICLE_HANDLERS,
    ...RADIO_HANDLERS,
    ...HOLIDAY_HANDLERS,
    ...TYPICAL_DISH_HANDLERS,
    ...TRADITIONAL_FAIR_AND_FESTIVAL_HANDLERS,
  }) as const;

export const createServer = async (): Promise<McpServer> => {
  const allTools = getAllTools();
  const allHandlers = getAllHandlers();

  const server = new McpServer({ name: 'mcp-api-colombia', version });

  for (const tool of allTools) {
    const handler = allHandlers[tool.name];
    server.registerTool(
      tool.name,
      {
        description: tool.description,
        inputSchema: createInputSchema(tool),
        outputSchema: toolOutputSchema,
      },
      async (arguments_) => {
        log.info('Received tool call', { toolName: tool.name });

        try {
          if (!handler) {
            throw new Error(`Unknown tool: ${tool.name}`);
          }
          return await handler({ params: { arguments: arguments_ } });
        } catch (error) {
          log.error('Error handling tool call', { toolName: tool.name, error: String(error) });
          return {
            content: [
              {
                type: 'text' as const,
                text: `Error: ${error instanceof Error ? error.message : String(error)}`,
              },
            ],
            isError: true,
          };
        }
      }
    );
  }

  return server;
};
