import { z } from 'zod';
import { CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';

export const emptySchema = {
  type: 'object',
  properties: {},
} as const;

export interface ToolResponse {
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
  _meta?: Record<string, unknown>;
  [key: string]: unknown;
}

export const commonSchemas = {
  id: z.number().min(1, 'Id must be greater than 0'),
  sortDirection: z.enum(['asc', 'desc']).optional(),
  sortBy: z.string().optional(),
} as const;

export type ToolRequest = z.infer<typeof CallToolRequestSchema>;
