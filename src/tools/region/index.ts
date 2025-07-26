import { z } from "zod";
import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { ToolHandlers } from "../../utils/types.js";
import { createToolResponse, executeApiCall, extractArguments, validateToolInput } from "../../utils/utils.js";
import { getApiV1Region } from "../../client/generated/index.js";
import { commonSchemas } from "../../utils/common/schemas.js";


// Schema definitions
const getApiV1RegionSchema = z.object({
  sortBy: commonSchemas.sortBy,
  sortDirection: commonSchemas.sortDirection,
});


const GET_REGION: Tool = {
  name: "get-region",
  description: "Get the list of regions in Colombia.",
  inputSchema: {
    type: "object",
    properties: {
      sortBy: {
        type: "string",
        description: "It can be sorted by any of the fields that have numerical, string, or date values (for example: Id, name, description, etc.)."
      },
      sortDirection: {
        type: "string",
        description: "Direction to sort the regions. Options: 'asc', 'desc'",
        enum: ["asc", "desc"]
      },
      required: [],
    },
  }
};

export const REGION_TOOLS = [
  GET_REGION
];

export const REGION_HANDLERS: ToolHandlers = {
  "get-region": async (request) => {

    const { sortBy, sortDirection } = extractArguments<{
      sortBy?: string;
      sortDirection?: "asc" | "desc";
    }>(request);

    // Validate input
    validateToolInput(
      getApiV1RegionSchema,
      { sortBy, sortDirection },
      `Get regions with sortBy: ${sortBy}, sortDirection: ${sortDirection}`,
    );

    const region = await executeApiCall(
      () => getApiV1Region({ query: { sortBy, sortDirection } }),
      "Get regions"
    );
    
    return createToolResponse(region);
  },
};