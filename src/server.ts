import { RestServerTransport } from '@chatmcp/sdk/server/rest.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import type { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';
import { version } from '../package.json';
import { Oura } from './oura';
import { registerAllTools } from './tools';

const server = new McpServer({
  name: 'oura-mcp',
  version,
});

if (!process.env.OURA_ACCESS_TOKEN) {
  throw new Error(`OURA_ACCESS_TOKEN is not set`);
}

const oura = new Oura(process.env.OURA_ACCESS_TOKEN);

// Register all Oura tools using the factory pattern
registerAllTools(server, oura);

const port = Number(process.env.PORT || '3000');

export async function startServer(
  options: { type: 'http'; endpoint: string } | { type: 'stdio' },
) {
  if (options.type === 'http') {
    const transport = new RestServerTransport({
      port,
      endpoint: options.endpoint,
    });
    // Cast needed: @chatmcp/sdk bundles an older MCP SDK with incompatible Transport type
    await server.connect(transport as unknown as Transport);

    await transport.startServer();
    console.log(`HTTP server: http://localhost:${port}${options.endpoint}`);
  } else {
    const transport = new StdioServerTransport();
    await server.connect(transport);
  }
}
