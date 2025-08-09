import Polka from 'polka';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { RestServerTransport } from '@chatmcp/sdk/server/rest.js';
import { version } from '../package.json';
import { Oura, GeneralOuraSchemaShape } from './oura';
import { dump } from 'js-yaml';
import { errorToToolResult } from './utils';
import { z } from 'zod';

const server = new McpServer({
  name: 'oura-mcp',
  version,
});

if (!process.env.OURA_ACCESS_TOKEN) {
  throw new Error(`OURA_ACCESS_TOKEN is not set`);
}

const oura = new Oura(process.env.OURA_ACCESS_TOKEN);

server.registerTool(
  'get_personal_info',
  {
    title: 'Get personal info from Oura',
    description: 'Get personal info from Oura',
  },
  async () => {
    try {
      const res = await oura.getPersonalInfo();
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

server.registerTool(
  'get_daily_activity',
  {
    title: 'Get daily activity from Oura',
    description: 'Get daily activity from Oura',
    inputSchema: GeneralOuraSchemaShape,
  },
  async (args) => {
    try {
      const res = await oura.getDailyActivity(args);
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

server.registerTool(
  'get_daily_cardiovascular_age',
  {
    title: 'Get daily cardiovascular age from Oura',
    description: 'Get daily cardiovascular age from Oura',
    inputSchema: GeneralOuraSchemaShape,
  },
  async (args) => {
    try {
      const res = await oura.getDailyCardiovascularAge(args);
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

server.registerTool(
  'get_daily_sleep',
  {
    title: 'Get daily sleep from Oura',
    description: 'Get daily sleep from Oura',
    inputSchema: GeneralOuraSchemaShape,
  },
  async (args) => {
    try {
      const res = await oura.getDailySleep(args);
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

server.registerTool(
  'get_daily_spo2',
  {
    title: 'Get daily SPO2 from Oura',
    description: 'Get daily SPO2 from Oura',
    inputSchema: GeneralOuraSchemaShape,
  },
  async (args) => {
    try {
      const res = await oura.getDailySpo2(args);
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

server.registerTool(
  'get_daily_stress',
  {
    title: 'Get daily stress from Oura',
    description: 'Get daily stress from Oura',
    inputSchema: GeneralOuraSchemaShape,
  },
  async (args) => {
    try {
      const res = await oura.getDailyStress(args);
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

server.registerTool(
  'get_heartrate',
  {
    title: 'Get heartrate from Oura',
    description: 'Get heartrate from Oura',
    inputSchema: GeneralOuraSchemaShape,
  },
  async (args) => {
    try {
      const res = await oura.getHeartrate(args);
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
