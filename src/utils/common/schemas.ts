
export const emptySchema = {
  type: "object",
  properties: {},
} as const;


export interface ToolResponse {
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
  _meta?: Record<string, unknown>;
  [key: string]: unknown;
}