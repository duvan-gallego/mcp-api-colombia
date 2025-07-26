import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { emptySchema } from "../../utils/common/schemas.js";
import { ToolHandlers } from "../../utils/types.js";
import { createToolResponse, executeApiCall } from "../../utils/utils.js";
import { getApiV1Region } from "../../client/generated/index.js";

const GET_REGION: Tool = {
  name: "get-region",
  description: "Get the list of regions in Colombia.",
  inputSchema: emptySchema,
};

export const REGION_TOOLS = [
  GET_REGION
];

export const REGION_HANDLERS: ToolHandlers = {
  "get-region": async () => {

    const region = await executeApiCall(
        () => getApiV1Region(), 
        "Get regions"
     );
    
    return createToolResponse(region);
  },
};