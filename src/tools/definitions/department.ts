import { z } from 'zod';
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ToolHandlers } from '../../utils/types.js';
import {
  createToolResponse,
  executeApiCall,
  extractArguments,
  validateToolInput,
} from '../../utils/utils.js';
import { getApiV1Department, getApiV1DepartmentById } from '../../client/generated/index.js';
import { commonSchemas } from '../../utils/common/schemas.js';

// Schema definitions
const getApiV1DepartmentSchema = z.object({
  sortBy: commonSchemas.sortBy,
  sortDirection: commonSchemas.sortDirection,
});

// Tool definitions
const GET_DEPARTMENTS: Tool = {
  name: 'get-departments',
  description: 'Get the list of departments in Colombia.',
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
        description: 'Direction to sort the departments. Options: "asc", "desc"',
        enum: ['asc', 'desc'],
      },
      required: [],
    },
  },
};

const GET_DEPARTMENT_BY_ID: Tool = {
  name: 'get-department-by-id',
  description: 'Get a specific department information by its ID.',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'number',
        description: 'The ID of the department to retrieve.',
      },
      required: ['id'],
    },
  },
};

export const DEPARTMENT_TOOLS = [GET_DEPARTMENTS, GET_DEPARTMENT_BY_ID];

export const DEPARTMENT_HANDLERS: ToolHandlers = {
  'get-departments': async (request) => {
    const { sortBy, sortDirection } = extractArguments<{
      sortBy?: string;
      sortDirection?: 'asc' | 'desc';
    }>(request);

    // Validate input
    validateToolInput(
      getApiV1DepartmentSchema,
      { sortBy, sortDirection },
      `Get departments with sortBy: ${sortBy}, sortDirection: ${sortDirection}`
    );

    const department = await executeApiCall(
      () => getApiV1Department({ query: { sortBy, sortDirection } }),
      'Get departments'
    );

    return createToolResponse(department);
  },
  'get-department-by-id': async (request) => {
    const { id } = extractArguments<{ id: number }>(request);

    // Validate input
    validateToolInput(z.object({ id: z.number() }), { id }, `Get department by ID: ${id}`);

    const department = await executeApiCall(
      () => getApiV1DepartmentById({ path: { id } }),
      'Get department by ID'
    );

    return createToolResponse(department);
  },
};
