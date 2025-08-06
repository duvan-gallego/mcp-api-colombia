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
  getApiV1TouristicAttraction,
  getApiV1TouristicAttractionById,
  getApiV1TouristicAttractionNameByName,
  getApiV1TouristicAttractionPagedList,
  getApiV1TouristicAttractionSearchByKeyword,
} from '../../client/generated/index.js';
import {
  commonPageSchemaWithSort,
  commonRequiredIdSchema,
  commonSortSchema,
} from '../../utils/common/schemas.js';
import { pageProperties, sortProperties } from '../../utils/common/tools-properties.js';

// Tool definitions
const GET_TOURISTIC_ATTRACTIONS: Tool = {
  name: 'get-touristic-attractions',
  description:
    'Get the list of touristic attractions in Colombia, including information about the city where they are located, the latitude, longitude and image',
  inputSchema: {
    type: 'object',
    properties: {
      ...sortProperties,
      required: [],
    },
  },
};

const GET_TOURISTIC_ATTRACTION_BY_ID: Tool = {
  name: 'get-touristic-attraction-by-id',
  description: 'Get a specific touristic attraction information by its ID.',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'number',
        description: 'The ID of the touristic attraction to retrieve.',
      },
      required: ['id'],
    },
  },
};

const GET_TOURISTIC_ATTRACTION_BY_NAME: Tool = {
  name: 'get-touristic-attraction-by-name',
  description: 'Get a specific touristic attraction information by its name.',
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'The name of the touristic attraction to retrieve.',
      },
      required: ['name'],
    },
  },
};

const SEARCH_TOURISTIC_ATTRACTION_BY_KEYWORD: Tool = {
  name: 'search-touristic-attraction-by-keyword',
  description:
    'Search for touristic attractions by a keyword in their Name, Description, Latitude or Longitude',
  inputSchema: {
    type: 'object',
    properties: {
      keyword: {
        type: 'string',
        description:
          'The keyword to search for in touristic attraction name, description, latitude or longitude.',
      },
      required: ['keyword'],
    },
  },
};

const GET_TOURISTIC_ATTRACTION_PAGINATED: Tool = {
  name: 'get-touristic-attraction-paginated',
  description:
    'Get a paginated list of touristic attractions in Colombia, using pagination including page, pageSize, total records and data',
  inputSchema: {
    type: 'object',
    properties: {
      ...pageProperties,
      ...sortProperties,
      required: ['page', 'pageSize'],
    },
  },
};

export const TOURISTIC_ATTRACTION_TOOLS = [
  GET_TOURISTIC_ATTRACTIONS,
  GET_TOURISTIC_ATTRACTION_BY_ID,
  GET_TOURISTIC_ATTRACTION_BY_NAME,
  SEARCH_TOURISTIC_ATTRACTION_BY_KEYWORD,
  GET_TOURISTIC_ATTRACTION_PAGINATED,
];

export const TOURISTIC_ATTRACTION_HANDLERS: ToolHandlers = {
  'get-touristic-attractions': async (request) => {
    const { sortBy, sortDirection } = extractArguments<SortOptions>(request);

    // Validate input
    validateToolInput(
      commonSortSchema,
      { sortBy, sortDirection },
      `Get touristic attractions with sortBy: ${sortBy}, sortDirection: ${sortDirection}`
    );

    const attractions = await executeApiCall(
      () => getApiV1TouristicAttraction({ query: { sortBy, sortDirection } }),
      'Get touristic attractions'
    );

    return createToolResponse(attractions);
  },
  'get-touristic-attraction-by-id': async (request) => {
    const { id } = extractArguments<{ id: number }>(request);

    // Validate input
    validateToolInput(commonRequiredIdSchema, { id }, `Get touristic attraction by ID: ${id}`);

    const attraction = await executeApiCall(
      () => getApiV1TouristicAttractionById({ path: { id } }),
      `Get touristic attraction by ID: ${id}`
    );

    return createToolResponse(attraction);
  },
  'get-touristic-attraction-by-name': async (request) => {
    const { name } = extractArguments<{ name: string }>(request);

    // Validate input
    validateToolInput(
      z.object({ name: z.string() }),
      { name },
      `Get touristic attraction by name: ${name}`
    );

    const attraction = await executeApiCall(
      () => getApiV1TouristicAttractionNameByName({ path: { name } }),
      'Get touristic attraction by name'
    );

    return createToolResponse(attraction);
  },
  'search-touristic-attraction-by-keyword': async (request) => {
    const { keyword } = extractArguments<{ keyword: string }>(request);

    // Validate input
    validateToolInput(
      z.object({ keyword: z.string() }),
      { keyword },
      `Search touristic attraction by keyword: ${keyword}`
    );

    const attractions = await executeApiCall(
      () => getApiV1TouristicAttractionSearchByKeyword({ path: { keyword } }),
      'Search touristic attraction by keyword'
    );

    return createToolResponse(attractions);
  },
  'get-touristic-attraction-paginated': async (request) => {
    const { page, pageSize, sortBy, sortDirection } =
      extractArguments<PageWithSortOptions>(request);

    // Validate input
    validateToolInput(
      commonPageSchemaWithSort,
      { page, pageSize, sortBy, sortDirection },
      `Get paginated touristic attractions with page: ${page}, pageSize: ${pageSize}, sortBy: ${sortBy}, sortDirection: ${sortDirection}`
    );

    const attractions = await executeApiCall(
      () =>
        getApiV1TouristicAttractionPagedList({
          query: { Page: page, PageSize: pageSize, SortBy: sortBy, SortDirection: sortDirection },
        }),
      'Get paginated touristic attractions'
    );

    return createToolResponse(attractions);
  },
};
