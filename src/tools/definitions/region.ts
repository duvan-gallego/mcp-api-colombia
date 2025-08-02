import { z } from 'zod';
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ToolHandlers } from '../../utils/types.js';
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
import { commonSchemas } from '../../utils/common/schemas.js';

// Schema definitions
const getApiV1RegionSchema = z.object({
  sortBy: commonSchemas.sortBy,
  sortDirection: commonSchemas.sortDirection,
});

const getApiV1RegionByIdSchema = z.object({
  id: commonSchemas.id,
});

const getApiV1RegionByIdDepartmentsSchema = z.object({
  id: commonSchemas.id,
  sortBy: commonSchemas.sortBy,
  sortDirection: commonSchemas.sortDirection,
});

// Tool definitions
const GET_REGIONS: Tool = {
  name: 'get-regions',
  description: 'Get the list of regions in Colombia.',
  inputSchema: {
    type: 'object',
    properties: {
      sortBy: {
        type: 'string',
        description:
          'It can be sorted by any of the fields that have numerical, string, or date values (for example: Id, name, description, etc.).',
      },
      sortDirection: {
        type: 'string',
        description: 'Direction to sort the regions. Options: "asc", "desc"',
        enum: ['asc', 'desc'],
      },
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
      sortBy: {
        type: 'string',
        description:
          'It can be sorted by any of the fields that have numerical, string, or date values (for example: Id, name, description, etc.).',
      },
      sortDirection: {
        type: 'string',
        description: 'Direction to sort the regions. Options: "asc", "desc"',
        enum: ['asc', 'desc'],
      },
      required: ['id'],
    },
  },
};

export const REGION_TOOLS = [GET_REGIONS, GET_REGION_BY_ID, GET_REGION_BY_ID_DEPARTMENTS];

export const REGION_HANDLERS: ToolHandlers = {
  'get-regions': async (request) => {
    const { sortBy, sortDirection } = extractArguments<{
      sortBy?: string;
      sortDirection?: 'asc' | 'desc';
    }>(request);

    // Validate input
    validateToolInput(
      getApiV1RegionSchema,
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
    validateToolInput(getApiV1RegionByIdSchema, { id }, `Get region by ID: ${id}`);

    const region = await executeApiCall(
      () => getApiV1RegionById({ path: { id } }),
      `Get region by ID: ${id}`
    );

    return createToolResponse(region);
  },
  'get-region-by-id-departments': async (request) => {
    const { id, sortBy, sortDirection } = extractArguments<{
      id: number;
      sortBy?: string;
      sortDirection?: 'asc' | 'desc';
    }>(request);

    // Validate input
    validateToolInput(
      getApiV1RegionByIdDepartmentsSchema,
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
