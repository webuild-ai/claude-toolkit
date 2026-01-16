# MCP Server Scaffold

Scaffold a new MCP (Model Context Protocol) server with best practices.

## Instructions

### 1. Create Project Structure

```bash
mkdir my-mcp-server
cd my-mcp-server

# Create directories
mkdir -p src/{tools,resources,prompts}
mkdir tests
```

### 2. Initialize Project

```bash
# TypeScript MCP Server
zsh -i -c "npm init -y"
zsh -i -c "npm install @modelcontextprotocol/sdk"
zsh -i -c "npm install --save-dev typescript @types/node"

# Initialize TypeScript
zsh -i -c "npx tsc --init"
```

### 3. Create Server Template

```typescript
// src/index.ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const server = new Server(
  {
    name: 'my-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'example_tool',
        description: 'An example tool',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Query parameter',
            },
          },
          required: ['query'],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'example_tool') {
    return {
      content: [
        {
          type: 'text',
          text: `Processed: ${args.query}`,
        },
      ],
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);
```

### 4. Add Tool Implementation

```typescript
// src/tools/search.ts
export async function searchTool(query: string) {
  // Implement search logic
  return {
    results: [
      {
        title: 'Result 1',
        content: 'Content here',
      },
    ],
  };
}
```

### 5. Create Configuration

```json
// package.json
{
  "name": "my-mcp-server",
  "version": "1.0.0",
  "type": "module",
  "bin": {
    "my-mcp-server": "./dist/index.js"
  },
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "tsc && node dist/index.js"
  }
}
```

### 6. Configure for Claude Desktop

```json
// ~/Library/Application Support/Claude/claude_desktop_config.json
{
  "mcpServers": {
    "my-mcp-server": {
      "command": "node",
      "args": ["/path/to/my-mcp-server/dist/index.js"]
    }
  }
}
```

### 7. Test Server

```bash
# Build
zsh -i -c "npm run build"

# Test locally
echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | node dist/index.js
```

## Output Format

```markdown
# MCP Server Scaffolded: my-mcp-server

## Structure Created
```
my-mcp-server/
├── src/
│   ├── index.ts
│   ├── tools/
│   │   └── search.ts
│   ├── resources/
│   └── prompts/
├── tests/
├── package.json
├── tsconfig.json
└── README.md
```

## Configuration
- Name: my-mcp-server
- Version: 1.0.0
- Transport: stdio
- Tools: 1 example tool

## Next Steps
1. Implement your tools in src/tools/
2. Add tests
3. Build: `npm run build`
4. Test: `npm run dev`
5. Configure in Claude Desktop
6. Publish to npm (optional)
```

## Best Practices

- Follow MCP SDK patterns
- Validate tool inputs
- Handle errors gracefully
- Add comprehensive tests
- Document tools clearly
- Version your server

## Notes

- MCP servers use stdio transport
- Tools must have JSON schemas
- Test before deploying
- Keep servers focused and simple
