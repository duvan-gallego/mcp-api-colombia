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
  getApiV1NativeCommunity,
  getApiV1NativeCommunityById,
  getApiV1NativeCommunityNameByName,
  getApiV1NativeCommunityPagedList,
  getApiV1NativeCommunitySearchByKeyword,
} from '../../client/generated/index.js';
import {
  commonPageSchemaWithSort,
  commonRequiredIdSchema,
  commonSortSchema,
} from '../../utils/common/schemas.js';
import { pageProperties, sortProperties } from '../../utils/common/tools-properties.js';

// Tool definitions
const GET_NATIVE_COMMUNITIES: Tool = {
  name: 'get-native-communities',
  description:
    'Get the list of native communities in Colombia, including general info like name, description, images, etc',
  inputSchema: {
    type: 'object',
    properties: {
      ...sortProperties,
      required: [],
    },
  },
};

const GET_NATIVE_COMMUNITY_BY_ID: Tool = {
  name: 'get-native-community-by-id',
  description: 'Get a specific native community information by its ID.',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'number',
        description: 'The ID of the native community to retrieve.',
      },
      required: ['id'],
    },
  },
};

const GET_NATIVE_COMMUNITY_BY_NAME: Tool = {
  name: 'get-native-community-by-name',
  description: 'Get a specific native community information by its name.',
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'The name of the native community to retrieve.',
      },
      required: ['name'],
    },
  },
};

const SEARCH_NATIVE_COMMUNITY_BY_KEYWORD: Tool = {
  name: 'search-native-community-by-keyword',
  description: 'Search for native communities by a keyword in their name, description or languages',
  inputSchema: {
    type: 'object',
    properties: {
      keyword: {
        type: 'string',
        description:
          'The keyword to search for in native community names, descriptions or languages.',
      },
      required: ['keyword'],
    },
  },
};

const GET_NATIVE_COMMUNITY_PAGINATED: Tool = {
  name: 'get-native-community-paginated',
  description:
    'Get a paginated list of native communities in Colombia, using pagination including page, pageSize, total records and data',
  inputSchema: {
    type: 'object',
    properties: {
      ...pageProperties,
      ...sortProperties,
      required: ['page', 'pageSize'],
    },
  },
};

export const NATIVE_COMMUNITY_TOOLS = [
  GET_NATIVE_COMMUNITIES,
  GET_NATIVE_COMMUNITY_BY_ID,
  GET_NATIVE_COMMUNITY_BY_NAME,
  SEARCH_NATIVE_COMMUNITY_BY_KEYWORD,
  GET_NATIVE_COMMUNITY_PAGINATED,
];

export const NATIVE_COMMUNITY_HANDLERS: ToolHandlers = {
  'get-native-communities': async (request) => {
    const { sortBy, sortDirection } = extractArguments<SortOptions>(request);

    // Validate input
    validateToolInput(
      commonSortSchema,
      { sortBy, sortDirection },
      `Get native communities with sortBy: ${sortBy}, sortDirection: ${sortDirection}`
    );

    const nativeCommunities = await executeApiCall(
      () => getApiV1NativeCommunity({ query: { sortBy, sortDirection } }),
      'Get native communities'
    );

    return createToolResponse(nativeCommunities);
  },
  'get-native-community-by-id': async (request) => {
    const { id } = extractArguments<{ id: number }>(request);

    // Validate input
    validateToolInput(commonRequiredIdSchema, { id }, `Get native community by ID: ${id}`);

    const nativeCommunity = await executeApiCall(
      () => getApiV1NativeCommunityById({ path: { id } }),
      'Get native community by ID'
    );

    return createToolResponse(nativeCommunity);
  },
  'get-native-community-by-name': async (request) => {
    const { name } = extractArguments<{ name: string }>(request);

    // Validate input
    validateToolInput(
      z.object({ name: z.string() }),
      { name },
      `Get native community by name: ${name}`
    );

    const nativeCommunity = await executeApiCall(
      () => getApiV1NativeCommunityNameByName({ path: { name } }),
      'Get native community by name'
    );

    return createToolResponse(nativeCommunity);
  },
  'search-native-community-by-keyword': async (request) => {
    const { keyword } = extractArguments<{ keyword: string }>(request);

    // Validate input
    validateToolInput(
      z.object({ keyword: z.string() }),
      { keyword },
      `Search native community by keyword: ${keyword}`
    );

    const nativeCommunities = await executeApiCall(
      () => getApiV1NativeCommunitySearchByKeyword({ path: { keyword } }),
      'Search native community by keyword'
    );

    return createToolResponse(nativeCommunities);
  },
  'get-native-community-paginated': async (request) => {
    const { page, pageSize, sortBy, sortDirection } =
      extractArguments<PageWithSortOptions>(request);

    // Validate input
    validateToolInput(
      commonPageSchemaWithSort,
      { page, pageSize, sortBy, sortDirection },
      `Get paginated native communities with page: ${page}, pageSize: ${pageSize}, sortBy: ${sortBy}, sortDirection: ${sortDirection}`
    );

    const nativeCommunities = await executeApiCall(
      () =>
        getApiV1NativeCommunityPagedList({
          query: { Page: page, PageSize: pageSize, SortBy: sortBy, SortDirection: sortDirection },
        }),
      'Get paginated native communities'
    );

    return createToolResponse(nativeCommunities);
  },
};
