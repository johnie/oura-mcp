import Polka from 'polka';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { RestServerTransport } from '@chatmcp/sdk/server/rest.js';
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
  options:
    | { type: 'http'; endpoint: string }
    | { type: 'sse' }
    | { type: 'stdio' }
) {
  if (options.type === 'http') {
    const transport = new RestServerTransport({
      port,
      endpoint: options.endpoint,
    });
    await server.connect(transport);

    await transport.startServer();
  } else if (options.type === 'sse') {
    const transports = new Map<string, SSEServerTransport>();

    const app = Polka();

    app.get('/sse', async (_req, res) => {
      const transport = new SSEServerTransport('/messages', res);
      transports.set(transport.sessionId, transport);
      res.on('close', () => {
        transports.delete(transport.sessionId);
      });
      await server.connect(transport);
    });

    app.post('/messages', async (req, res) => {
      const sessionId = req.query.sessionId as string | undefined;
      if (!sessionId) {
        res.status(400).send('Missing sessionId');
        return;
      }
      const transport = transports.get(sessionId);
      if (transport) {
        await transport.handlePostMessage(req, res);
      } else {
        res.status(400).send('No transport found for sessionId');
      }
    });

    app.listen(port);
    console.log(`sse server: http://localhost:${port}/sse`);
  } else {
    const transport = new StdioServerTransport();
    await server.connect(transport);
  }
}
