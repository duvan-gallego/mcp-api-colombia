import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { SortOptions, ToolHandlers } from '../../utils/types.js';
import {
  createToolResponse,
  executeApiCall,
  extractArguments,
  validateToolInput,
} from '../../utils/utils.js';
import { getApiV1Map, getApiV1MapById } from '../../client/generated/index.js';
import { commonRequiredIdSchema, commonSortSchema } from '../../utils/common/schemas.js';
import { sortProperties } from '../../utils/common/tools-properties.js';

// Tool definitions
const GET_MAPS: Tool = {
  name: 'get-maps',
  description:
    'Get the list of maps in Colombia, including natural areas, departments distribution, water, etc.',
  inputSchema: {
    type: 'object',
    properties: {
      ...sortProperties,
      required: [],
    },
  },
};

const GET_MAP_BY_ID: Tool = {
  name: 'get-map-by-id',
  description: 'Get a specific map information by its ID.',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'number',
        description: 'The ID of the map to retrieve.',
      },
      required: ['id'],
    },
  },
};

export const MAP_TOOLS = [GET_MAPS, GET_MAP_BY_ID];

export const MAP_HANDLERS: ToolHandlers = {
  'get-maps': async (request) => {
    const { sortBy, sortDirection } = extractArguments<SortOptions>(request);

    // Validate input
    validateToolInput(
      commonSortSchema,
      { sortBy, sortDirection },
      `Get maps with sortBy: ${sortBy}, sortDirection: ${sortDirection}`
    );

    const maps = await executeApiCall(
      () => getApiV1Map({ query: { sortBy, sortDirection } }),
      'Get maps'
    );

    return createToolResponse(maps);
  },
  'get-map-by-id': async (request) => {
    const { id } = extractArguments<{ id: number }>(request);

    // Validate input
    validateToolInput(commonRequiredIdSchema, { id }, `Get map by ID: ${id}`);

    const map = await executeApiCall(() => getApiV1MapById({ path: { id } }), 'Get map by ID');

    return createToolResponse(map);
  },
};
