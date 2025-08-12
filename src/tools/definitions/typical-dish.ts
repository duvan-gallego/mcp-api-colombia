import { Tool } from '@modelcontextprotocol/sdk/types.js';
import {
  PageWithSortOptions,
  SortOptions,
  SortOptionsWithRequiredId,
  ToolHandlers,
} from '../../utils/types.js';
import {
  createToolResponse,
  executeApiCall,
  extractArguments,
  validateToolInput,
} from '../../utils/utils.js';
import {
  getApiV1TypicalDish,
  getApiV1TypicalDishById,
  getApiV1TypicalDishByIdDepartment,
  getApiV1TypicalDishNameByName,
  getApiV1TypicalDishPagedList,
  getApiV1TypicalDishSearchByKeyword,
} from '../../client/generated/index.js';
import {
  commonPageSchemaWithSort,
  commonRequiredIdSchema,
  commonSortSchema,
  commonSortSchemaWithRequiredId,
} from '../../utils/common/schemas.js';
import { pageProperties, sortProperties } from '../../utils/common/tools-properties.js';
import z from 'zod';

// Tool definitions
const GET_TYPICAL_DISHS: Tool = {
  name: 'get-typical-dishs',
  description:
    'Get the list of typical dishes in colombia including a general info like description, image reference.',
  inputSchema: {
    type: 'object',
    properties: {
      ...sortProperties,
      required: [],
    },
  },
};

const GET_TYPICAL_DISH_BY_ID: Tool = {
  name: 'get-typical-dish-by-id',
  description: 'Get a specific typical dish information by its ID.',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'number',
        description: 'The ID of the typical dish to retrieve.',
      },
      required: ['id'],
    },
  },
};

const GET_TYPICAL_DISH_BY_ID_DEPARTMENT: Tool = {
  name: 'get-typical-dish-by-id-department',
  description: 'Get a list of typical dishes filtered by department ID',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'number',
        description: 'The ID of the department to retrieve from the typical dish.',
      },
      ...sortProperties,
      required: ['id'],
    },
  },
};

const GET_TYPICAL_DISH_BY_NAME: Tool = {
  name: 'get-typical-dish-by-name',
  description: 'Get a specific typical dish information by its name.',
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'The name of the typical dish to retrieve.',
      },
      required: ['name'],
    },
  },
};

const SEARCH_TYPICAL_DISH_BY_KEYWORD: Tool = {
  name: 'search-typical-dish-by-keyword',
  description: 'Search for typical dishes by a keyword in their name or description.',
  inputSchema: {
    type: 'object',
    properties: {
      keyword: {
        type: 'string',
        description: 'The keyword to search for in typical dish names or descriptions.',
      },
      required: ['keyword'],
    },
  },
};

const GET_TYPICAL_DISH_PAGINATED: Tool = {
  name: 'get-typical-dish-paginated',
  description:
    'Get a paginated list of typical dishes in Colombia, using pagination including page, pageSize, total records and data',
  inputSchema: {
    type: 'object',
    properties: {
      ...pageProperties,
      ...sortProperties,
      required: ['page', 'pageSize'],
    },
  },
};

export const TYPICAL_DISH_TOOLS = [
  GET_TYPICAL_DISHS,
  GET_TYPICAL_DISH_BY_ID,
  GET_TYPICAL_DISH_BY_ID_DEPARTMENT,
  GET_TYPICAL_DISH_BY_NAME,
  SEARCH_TYPICAL_DISH_BY_KEYWORD,
  GET_TYPICAL_DISH_PAGINATED,
];

export const TYPICAL_DISH_HANDLERS: ToolHandlers = {
  'get-typical-dishs': async (request) => {
    const { sortBy, sortDirection } = extractArguments<SortOptions>(request);

    // Validate input
    validateToolInput(
      commonSortSchema,
      { sortBy, sortDirection },
      `Get typical dishes with sortBy: ${sortBy}, sortDirection: ${sortDirection}`
    );

    const typicalDishes = await executeApiCall(
      () => getApiV1TypicalDish({ query: { sortBy, sortDirection } }),
      'Get typical dishes'
    );

    return createToolResponse(typicalDishes);
  },
  'get-typical-dish-by-id': async (request) => {
    const { id } = extractArguments<{ id: number }>(request);

    // Validate input
    validateToolInput(commonRequiredIdSchema, { id }, `Get typical dish by ID: ${id}`);

    const typicalDish = await executeApiCall(
      () => getApiV1TypicalDishById({ path: { id } }),
      `Get typical dish by ID: ${id}`
    );

    return createToolResponse(typicalDish);
  },
  'get-typical-dish-by-id-department': async (request) => {
    const { id, sortBy, sortDirection } = extractArguments<SortOptionsWithRequiredId>(request);

    // Validate input
    validateToolInput(
      commonSortSchemaWithRequiredId,
      { id, sortBy, sortDirection },
      `Get typical dish filtered by department ID: ${id}`
    );

    const typicalDishes = await executeApiCall(
      () => getApiV1TypicalDishByIdDepartment({ path: { id }, query: { sortBy, sortDirection } }),
      `Get typical dish filtered by department ID: ${id}`
    );

    return createToolResponse(typicalDishes);
  },
  'get-typical-dish-by-name': async (request) => {
    const { name } = extractArguments<{ name: string }>(request);

    // Validate input
    validateToolInput(
      z.object({ name: z.string() }),
      { name },
      `Get typical dish by name: ${name}`
    );

    const typicalDish = await executeApiCall(
      () => getApiV1TypicalDishNameByName({ path: { name } }),
      'Get typical dish by name'
    );

    return createToolResponse(typicalDish);
  },
  'search-typical-dish-by-keyword': async (request) => {
    const { keyword } = extractArguments<{ keyword: string }>(request);

    // Validate input
    validateToolInput(
      z.object({ keyword: z.string() }),
      { keyword },
      `Search typical dish by keyword: ${keyword}`
    );

    const typicalDishes = await executeApiCall(
      () => getApiV1TypicalDishSearchByKeyword({ path: { keyword } }),
      'Search typical dish by keyword'
    );

    return createToolResponse(typicalDishes);
  },
  'get-typical-dish-paginated': async (request) => {
    const { page, pageSize, sortBy, sortDirection } =
      extractArguments<PageWithSortOptions>(request);

    // Validate input
    validateToolInput(
      commonPageSchemaWithSort,
      { page, pageSize, sortBy, sortDirection },
      `Get paginated typical dishes with page: ${page}, pageSize: ${pageSize}, sortBy: ${sortBy}, sortDirection: ${sortDirection}`
    );

    const typicalDishes = await executeApiCall(
      () =>
        getApiV1TypicalDishPagedList({
          query: { Page: page, PageSize: pageSize, SortBy: sortBy, SortDirection: sortDirection },
        }),
      'Get paginated typical dishes'
    );

    return createToolResponse(typicalDishes);
  },
};
