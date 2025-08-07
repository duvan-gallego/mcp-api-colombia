import { z } from 'zod';
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { PageWithSortOptions, SortOptions, ToolHandlers } from '../../utils/types.js';
import {
  createToolResponse,
  executeApiCall,
  extractArguments,
  validateToolInput,
} from '../../utils/utils.js';
import {
  getApiV1NaturalArea,
  getApiV1NaturalAreaById,
  getApiV1NaturalAreaNameByName,
  getApiV1NaturalAreaPagedList,
  getApiV1NaturalAreaSearchByKeyword,
} from '../../client/generated/index.js';
import {
  commonPageSchemaWithSort,
  commonRequiredIdSchema,
  commonSortSchema,
} from '../../utils/common/schemas.js';
import { pageProperties, sortProperties } from '../../utils/common/tools-properties.js';

// Tool definitions
const GET_NATURAL_AREAS: Tool = {
  name: 'get-natural-areas',
  description: 'Get the list of natural areas in Colombia.',
  inputSchema: {
    type: 'object',
    properties: {
      ...sortProperties,
      required: [],
    },
  },
};

const GET_NATURAL_AREA_BY_ID: Tool = {
  name: 'get-natural-area-by-id',
  description: 'Get a specific natural area information by its ID.',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'number',
        description: 'The ID of the natural area to retrieve.',
      },
      required: ['id'],
    },
  },
};

const GET_NATURAL_AREA_BY_NAME: Tool = {
  name: 'get-natural-area-by-name',
  description: 'Get a specific natural area information by its name.',
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'The name of the natural area to retrieve.',
      },
      required: ['name'],
    },
  },
};

const SEARCH_NATURAL_AREA_BY_KEYWORD: Tool = {
  name: 'search-natural-area-by-keyword',
  description: 'Search for natural areas by a keyword in their name or description.',
  inputSchema: {
    type: 'object',
    properties: {
      keyword: {
        type: 'string',
        description: 'The keyword to search for in natural area names or description.',
      },
      required: ['keyword'],
    },
  },
};

const GET_NATURAL_AREA_PAGINATED: Tool = {
  name: 'get-natural-area-paginated',
  description:
    'Get a paginated list of natural areas in Colombia, using pagination including page, pageSize, total records and data',
  inputSchema: {
    type: 'object',
    properties: {
      ...pageProperties,
      ...sortProperties,
      required: ['page', 'pageSize'],
    },
  },
};

export const NATURAL_AREA_TOOLS = [
  GET_NATURAL_AREAS,
  GET_NATURAL_AREA_BY_ID,
  GET_NATURAL_AREA_BY_NAME,
  SEARCH_NATURAL_AREA_BY_KEYWORD,
  GET_NATURAL_AREA_PAGINATED,
];

export const NATURAL_AREA_HANDLERS: ToolHandlers = {
  'get-natural-areas': async (request) => {
    const { sortBy, sortDirection } = extractArguments<SortOptions>(request);

    // Validate input
    validateToolInput(
      commonSortSchema,
      { sortBy, sortDirection },
      `Get natural areas with sortBy: ${sortBy}, sortDirection: ${sortDirection}`
    );

    const naturalAreas = await executeApiCall(
      () => getApiV1NaturalArea({ query: { sortBy, sortDirection } }),
      'Get natural areas'
    );

    return createToolResponse(naturalAreas);
  },
  'get-natural-area-by-id': async (request) => {
    const { id } = extractArguments<{ id: number }>(request);

    // Validate input
    validateToolInput(commonRequiredIdSchema, { id }, `Get natural area by ID: ${id}`);

    const naturalArea = await executeApiCall(
      () => getApiV1NaturalAreaById({ path: { id } }),
      'Get natural area by ID'
    );

    return createToolResponse(naturalArea);
  },
  'get-natural-area-by-name': async (request) => {
    const { name } = extractArguments<{ name: string }>(request);

    // Validate input
    validateToolInput(
      z.object({ name: z.string() }),
      { name },
      `Get natural area by name: ${name}`
    );

    const naturalArea = await executeApiCall(
      () => getApiV1NaturalAreaNameByName({ path: { name } }),
      'Get natural area by name'
    );

    return createToolResponse(naturalArea);
  },
  'search-natural-area-by-keyword': async (request) => {
    const { keyword } = extractArguments<{ keyword: string }>(request);

    // Validate input
    validateToolInput(
      z.object({ keyword: z.string() }),
      { keyword },
      `Search department by keyword: ${keyword}`
    );

    const naturalAreas = await executeApiCall(
      () => getApiV1NaturalAreaSearchByKeyword({ path: { keyword } }),
      'Search natural area by keyword'
    );

    return createToolResponse(naturalAreas);
  },
  'get-natural-area-paginated': async (request) => {
    const { page, pageSize, sortBy, sortDirection } =
      extractArguments<PageWithSortOptions>(request);

    // Validate input
    validateToolInput(
      commonPageSchemaWithSort,
      { page, pageSize, sortBy, sortDirection },
      `Get paginated natural areas with page: ${page}, pageSize: ${pageSize}, sortBy: ${sortBy}, sortDirection: ${sortDirection}`
    );

    const naturalAreas = await executeApiCall(
      () =>
        getApiV1NaturalAreaPagedList({
          query: { Page: page, PageSize: pageSize, SortBy: sortBy, SortDirection: sortDirection },
        }),
      'Get paginated natural areas'
    );

    return createToolResponse(naturalAreas);
  },
};
