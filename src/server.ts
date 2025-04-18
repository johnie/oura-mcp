import Polka from 'polka';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { RestServerTransport } from '@chatmcp/sdk/server/rest.js';
import { version } from '../package.json';
import { Raindrop } from './oura';
import { dump } from 'js-yaml';
import { errorToToolResult } from './utils';

const server = new McpServer(
  {
    name: 'oura-mcp',
    version,
  },
  {
    capabilities: {
      logging: {},
      tools: {},
    },
  }
);

if (!process.env.OURA_ACCESS_TOKEN) {
  throw new Error(`OURA_ACCESS_TOKEN is not set`);
}

const raindrop = new Raindrop(process.env.OURA_ACCESS_TOKEN);

server.tool(
  'get_personal_info',
  'Get personal info from Oura',
  {},
  async () => {
    try {
      const res = await raindrop.getPersonalInfo();
      return {
        content: [
          {
            type: 'text',
            text: dump(res),
          },
        ],
      };
    } catch (error) {
      return errorToToolResult(error);
    }
  }
);
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

    app.get('/sse', async (req, res) => {
      console.log(req);
      const transport = new SSEServerTransport('/messages', res);
      transports.set(transport.sessionId, transport);
      res.on('close', () => {
        transports.delete(transport.sessionId);
      });
      await server.connect(transport);
    });

    app.post('/messages', async (req, res) => {
      const sessionId = req.query.sessionId as string;
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
