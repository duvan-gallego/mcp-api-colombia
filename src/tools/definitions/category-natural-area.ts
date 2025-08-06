import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { SortOptions, ToolHandlers } from '../../utils/types.js';
import {
  createToolResponse,
  executeApiCall,
  extractArguments,
  validateToolInput,
} from '../../utils/utils.js';
import {
  getApiV1CategoryNaturalArea,
  getApiV1CategoryNaturalAreaById,
  getApiV1CategoryNaturalAreaByIdNaturalAreas,
} from '../../client/generated/index.js';
import { commonRequiredIdSchema, commonSortSchema } from '../../utils/common/schemas.js';
import { sortProperties } from '../../utils/common/tools-properties.js';

// Tool definitions
const GET_CATEGORY_NATURAL_AREAS: Tool = {
  name: 'get-category-natural-areas',
  description: 'Get the list of category natural areas in Colombia',
  inputSchema: {
    type: 'object',
    properties: {
      ...sortProperties,
      required: [],
    },
  },
};

const GET_CATEGORY_NATURAL_AREA_BY_ID: Tool = {
  name: 'get-category-natural-area-by-id',
  description: 'Get a specific category natural area information by its ID.',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'number',
        description: 'The ID of the category natural area to retrieve.',
      },
      required: ['id'],
    },
  },
};

const GET_CATEGORY_NATURAL_AREA_BY_ID_NATURAL_AREAS: Tool = {
  name: 'get-category-natural-area-by-id-natural-areas',
  description: 'Get the information for the category natural area with the provided id',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'number',
        description: 'The ID of the category natural area to retrieve.',
      },
      required: ['id'],
    },
  },
};

export const CATEGORY_NATURAL_AREA_TOOLS = [
  GET_CATEGORY_NATURAL_AREAS,
  GET_CATEGORY_NATURAL_AREA_BY_ID,
  GET_CATEGORY_NATURAL_AREA_BY_ID_NATURAL_AREAS,
];

export const CATEGORY_NATURAL_AREA_HANDLERS: ToolHandlers = {
  'get-category-natural-areas': async (request) => {
    const { sortBy, sortDirection } = extractArguments<SortOptions>(request);

    // Validate input
    validateToolInput(
      commonSortSchema,
      { sortBy, sortDirection },
      `Get category natural areas with sortBy: ${sortBy}, sortDirection: ${sortDirection}`
    );

    const categoryNaturalAreas = await executeApiCall(
      () => getApiV1CategoryNaturalArea({ query: { sortBy, sortDirection } }),
      'Get category natural areas'
    );

    return createToolResponse(categoryNaturalAreas);
  },
  'get-category-natural-area-by-id': async (request) => {
    const { id } = extractArguments<{ id: number }>(request);

    // Validate input
    validateToolInput(commonRequiredIdSchema, { id }, `Get category natural area by ID: ${id}`);

    const categoryNaturalArea = await executeApiCall(
      () => getApiV1CategoryNaturalAreaById({ path: { id } }),
      'Get category natural area by ID'
    );

    return createToolResponse(categoryNaturalArea);
  },
  'get-category-natural-area-by-id-natural-areas': async (request) => {
    const { id } = extractArguments<{ id: number }>(request);

    // Validate input
    validateToolInput(
      commonRequiredIdSchema,
      { id },
      `Get category natural area by ID natural areas: ${id}`
    );

    const categoryNaturalArea = await executeApiCall(
      () => getApiV1CategoryNaturalAreaByIdNaturalAreas({ path: { id } }),
      'Get category natural area by ID natural areas'
    );

    return createToolResponse(categoryNaturalArea);
  },
};
