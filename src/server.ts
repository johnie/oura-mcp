import Polka from 'polka';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { RestServerTransport } from '@chatmcp/sdk/server/rest.js';
import { version } from '../package.json';
import { Oura, GeneralOuraSchema } from '@/oura';
import { dump } from 'js-yaml';
import { errorToToolResult } from '@/utils';
import { z } from 'zod/v3';

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

// if (!process.env.OURA_ACCESS_TOKEN) {
//   throw new Error(`OURA_ACCESS_TOKEN is not set`);
// }

const oura = new Oura('5E4THDOC2THCH6OYEWBYV62TZMW6HPTF');

server.registerTool(
  'get_personal_info',
  {
    title: 'Oura: Get Personal Info',
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
    title: 'Oura: Get Daily Activity',
    description: 'Get daily activity from Oura',
    inputSchema: GeneralOuraSchema,
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
    title: 'Oura: Get Daily Cardiovascular Age',
    description: 'Get daily cardiovascular age from Oura',
    inputSchema: GeneralOuraSchema,
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
    title: 'Oura: Get Daily Sleep',
    description: 'Get daily sleep from Oura',
    inputSchema: GeneralOuraSchema,
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
    title: 'Oura: Get Daily SPO2',
    description: 'Get daily SPO2 from Oura',
    inputSchema: GeneralOuraSchema,
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
    title: 'Oura: Get Daily Stress',
    description: 'Get daily stress from Oura',
    inputSchema: GeneralOuraSchema,
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
    title: 'Oura: Get Heartrate',
    description: 'Get heartrate from Oura',
    inputSchema: GeneralOuraSchema,
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
