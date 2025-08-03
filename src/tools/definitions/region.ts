import { z } from 'zod';
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { SortOptions, SortOptionsWithRequiredId, ToolHandlers } from '../../utils/types.js';
import {
  createToolResponse,
  executeApiCall,
  extractArguments,
  validateToolInput,
} from '../../utils/utils.js';
import {
  getApiV1Region,
  getApiV1RegionById,
  getApiV1RegionByIdDepartments,
} from '../../client/generated/index.js';
import {
  commonRequiredIdSchema,
  commonSortSchema,
  commonSortSchemaWithRequiredId,
} from '../../utils/common/schemas.js';
import { sortProperties } from '../../utils/common/tools-properties.js';

// Tool definitions
const GET_REGIONS: Tool = {
  name: 'get-regions',
  description: 'Get the list of regions in Colombia.',
  inputSchema: {
    type: 'object',
    properties: {
      ...sortProperties,
      required: [],
    },
  },
};

const GET_REGION_BY_ID: Tool = {
  name: 'get-region-by-id',
  description: 'Get a specific region information by its ID.',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'number',
        description: 'The ID of the region to retrieve.',
      },
      required: ['id'],
    },
  },
};

const GET_REGION_BY_ID_DEPARTMENTS: Tool = {
  name: 'get-region-by-id-departments',
  description: 'Get a specific region information by its ID including departments.',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'number',
        description: 'The ID of the region to retrieve.',
      },
      ...sortProperties,
      required: ['id'],
    },
  },
};

export const REGION_TOOLS = [GET_REGIONS, GET_REGION_BY_ID, GET_REGION_BY_ID_DEPARTMENTS];

export const REGION_HANDLERS: ToolHandlers = {
  'get-regions': async (request) => {
    const { sortBy, sortDirection } = extractArguments<SortOptions>(request);

    // Validate input
    validateToolInput(
      commonSortSchema,
      { sortBy, sortDirection },
      `Get regions with sortBy: ${sortBy}, sortDirection: ${sortDirection}`
    );

    const region = await executeApiCall(
      () => getApiV1Region({ query: { sortBy, sortDirection } }),
      'Get regions'
    );

    return createToolResponse(region);
  },
  'get-region-by-id': async (request) => {
    const { id } = extractArguments<{ id: number }>(request);

    // Validate input
    validateToolInput(commonRequiredIdSchema, { id }, `Get region by ID: ${id}`);

    const region = await executeApiCall(
      () => getApiV1RegionById({ path: { id } }),
      `Get region by ID: ${id}`
    );

    return createToolResponse(region);
  },
  'get-region-by-id-departments': async (request) => {
    const { id, sortBy, sortDirection } = extractArguments<SortOptionsWithRequiredId>(request);

    // Validate input
    validateToolInput(
      commonSortSchemaWithRequiredId,
      { id, sortBy, sortDirection },
      `Get region by ID including departments: ${id}`
    );

    const region = await executeApiCall(
      () => getApiV1RegionByIdDepartments({ path: { id }, query: { sortBy, sortDirection } }),
      `Get region by ID including departments: ${id}`
    );

    return createToolResponse(region);
  },
};
