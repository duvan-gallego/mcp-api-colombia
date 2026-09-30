import { CallToolResult } from '@modelcontextprotocol/server';
import { z } from 'zod';

export const emptySchema = {
  type: 'object',
  properties: {},
} as const;

export const toolOutputSchema = z.object({
  data: z.unknown(),
});

export type ToolResponse = CallToolResult;

// Schema definitions

export const commonSchemas = {
  id: z.number().min(1, 'Id must be greater than 0'),
  sortDirection: z.enum(['asc', 'desc']).optional(),
  sortBy: z.string().optional(),
} as const;

export const commonRequiredIdSchema = z.object({
  id: commonSchemas.id,
});

export const commonSortSchema = z.object({
  sortBy: commonSchemas.sortBy,
  sortDirection: commonSchemas.sortDirection,
});

export const commonSortSchemaWithRequiredId = z.object({
  id: commonSchemas.id,
  sortBy: commonSchemas.sortBy,
  sortDirection: commonSchemas.sortDirection,
});

export const commonPageSchemaWithSort = z.object({
  page: z.number().min(1, 'Page must be greater than 0'),
  pageSize: z.number().min(1, 'Page size must be greater than 0'),
  sortBy: commonSchemas.sortBy,
  sortDirection: commonSchemas.sortDirection,
});

export type ToolRequest = {
  params: {
    arguments?: Record<string, unknown>;
  };
};
