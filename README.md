# Api Colombia MCP Server

The Model Context Protocol (MCP) is a standardized protocol for managing context between large language models (LLMs) and external systems. This repository provides an MCP Server for the [api-colombia](https://api-colombia.com/) API, allowing you to use the API throught natural language. This MCP server supports the transport types STDIO and Streamable HTTP.

# Api Colombia

On its creators words, API Colombia is a public RESTful API that enables users to access a wide range of public information about the country of Colombia.

## Getting started

After cloning the project, install all the dependencies

```
pnpm install
```

Once all the dependencies are installed, generate the [api-colombia](https://api-colombia.com/) client

```
pnpm prepare
```

### Test it by using the MCP Inspector with the STDIO transport type

```
npx @modelcontextprotocol/inspector node dist/index.js --stdio
```

Note: If you make changes to your code, remember to rebuild:

```
pnpm build
```

### Test it by using the MCP Inspector with the streamable HTTP transport type

1. Start the HTTP server

```
pnpm start
```

2. Start the MCP inspector

```
npx @modelcontextprotocol/inspector
```

3. Connect the MCP inspector to the local HTTP server

   <img width="1197" height="764" alt="image" src="https://github.com/user-attachments/assets/739afeaf-ba07-4e98-9b85-0ef2458151b4" />

### Test it by using LM Studio

1. Download [LM Studio](https://lmstudio.ai/)
2. Download and load the model you want to use for testing. A small but good one at the moment is the [Qwen3 4B Thinking 2507](https://modelscope.cn/models/Qwen/Qwen3-4B-Thinking-2507) model
3. Build and start the MCP server

```
 pnpm build && pnpm start
```

4. Add the following configuration in the LM Studio `mcp.json` file. You can find more info about this [here](https://lmstudio.ai/blog/lmstudio-v0.3.17)

```
{
  "mcpServers": {
    "mcp-api-colombia": {
      "url": "http://localhost:3000/mcp"
    }
  }
}
```

5. Check that you can see all the available tools and start interacting with them

Note: Note: Since this model is a small one and only has a context length of 32,768, you can't load all the tools at once, and because of that you will need to only load the ones you will work with. With bigger models that support a bigger context length, that's not a problem.


## License

MIT License
