import Polka from 'polka';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { RestServerTransport } from '@chatmcp/sdk/server/rest.js';
import { version } from '../package.json';
import { Oura, GeneralOuraSchemaShape } from './oura';
import { errorToToolResult, truncateResponse } from './utils';
import {
  ResponseFormat,
  responseFormatSchema,
  formatPersonalInfo,
  formatDailyActivity,
  formatCardiovascularAge,
  formatDailySleep,
  formatDailySpo2,
  formatDailyStress,
  formatHeartrate,
} from './formatters';

const server = new McpServer({
  name: 'oura-mcp',
  version,
});

if (!process.env.OURA_ACCESS_TOKEN) {
  throw new Error(`OURA_ACCESS_TOKEN is not set`);
}

const oura = new Oura(process.env.OURA_ACCESS_TOKEN);

// Standard annotations for read-only Oura data tools
const readOnlyAnnotations = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: true,
};

server.registerTool(
  'oura_get_personal_info',
  {
    title: 'Get personal info from Oura',
    description: `Fetch user profile information from Oura Ring.

Returns personal data including:
- User ID and email
- Age, weight, height
- Biological sex

Args:
  - response_format ('json' | 'markdown'): Output format (default: 'json')

Use when: User asks about their Oura profile, account info, or personal metrics.`,
    inputSchema: {
      response_format: responseFormatSchema,
    },
    annotations: readOnlyAnnotations,
  },
  async (args) => {
    try {
      const res = await oura.getPersonalInfo();
      const format = args.response_format ?? ResponseFormat.JSON;
      return {
        content: [
          {
            type: 'text',
            text: truncateResponse(formatPersonalInfo(res, format)),
          },
        ],
      };
    } catch (error) {
      return errorToToolResult(error);
    }
  }
);

server.registerTool(
  'oura_get_daily_activity',
  {
    title: 'Get daily activity from Oura',
    description: `Fetch daily activity data from Oura Ring.

Returns activity metrics including:
- Activity score (0-100) and contributor scores
- Steps taken and equivalent walking distance
- Active calories and total calories burned
- High/medium/low activity minutes
- Sedentary time and inactivity alerts

Args:
  - start_date (string, required): Start date in YYYY-MM-DD format
  - end_date (string, optional): End date in YYYY-MM-DD format (defaults to today)
  - limit (number, optional): Max results to return (default: 50, max: 200)
  - response_format ('json' | 'markdown'): Output format (default: 'json')

Use when: User asks about daily activity, steps, calories, movement, or exercise patterns.`,
    inputSchema: GeneralOuraSchemaShape,
    annotations: readOnlyAnnotations,
  },
  async (args) => {
    try {
      const res = await oura.getDailyActivity(args);
      return {
        content: [
          {
            type: 'text',
            text: truncateResponse(formatDailyActivity(res, args.response_format)),
          },
        ],
      };
    } catch (error) {
      return errorToToolResult(error);
    }
  }
);

server.registerTool(
  'oura_get_daily_cardiovascular_age',
  {
    title: 'Get daily cardiovascular age from Oura',
    description: `Fetch cardiovascular age estimates from Oura Ring.

Returns vascular health metrics including:
- Estimated vascular age (in years)
- Comparison to chronological age

Cardiovascular age is calculated based on resting heart rate, heart rate variability, and other factors. A lower vascular age than chronological age indicates good cardiovascular health.

Args:
  - start_date (string, required): Start date in YYYY-MM-DD format
  - end_date (string, optional): End date in YYYY-MM-DD format (defaults to today)
  - limit (number, optional): Max results to return (default: 50, max: 200)
  - response_format ('json' | 'markdown'): Output format (default: 'json')

Use when: User asks about heart health, cardiovascular age, or vascular fitness.`,
    inputSchema: GeneralOuraSchemaShape,
    annotations: readOnlyAnnotations,
  },
  async (args) => {
    try {
      const res = await oura.getDailyCardiovascularAge(args);
      return {
        content: [
          {
            type: 'text',
            text: truncateResponse(formatCardiovascularAge(res, args.response_format)),
          },
        ],
      };
    } catch (error) {
      return errorToToolResult(error);
    }
  }
);

server.registerTool(
  'oura_get_daily_sleep',
  {
    title: 'Get daily sleep from Oura',
    description: `Fetch daily sleep summary data from Oura Ring.

Returns sleep metrics including:
- Sleep score (0-100) and contributor scores
- Total sleep duration
- Sleep efficiency percentage
- Time in each sleep stage (deep, REM, light)
- Sleep latency (time to fall asleep)
- Restfulness and timing scores

Args:
  - start_date (string, required): Start date in YYYY-MM-DD format
  - end_date (string, optional): End date in YYYY-MM-DD format (defaults to today)
  - limit (number, optional): Max results to return (default: 50, max: 200)
  - response_format ('json' | 'markdown'): Output format (default: 'json')

Use when: User asks about sleep quality, sleep duration, sleep scores, or sleep patterns.`,
    inputSchema: GeneralOuraSchemaShape,
    annotations: readOnlyAnnotations,
  },
  async (args) => {
    try {
      const res = await oura.getDailySleep(args);
      return {
        content: [
          {
            type: 'text',
            text: truncateResponse(formatDailySleep(res, args.response_format)),
          },
        ],
      };
    } catch (error) {
      return errorToToolResult(error);
    }
  }
);

server.registerTool(
  'oura_get_daily_spo2',
  {
    title: 'Get daily SPO2 from Oura',
    description: `Fetch blood oxygen saturation (SpO2) data from Oura Ring.

Returns oxygen metrics including:
- Average SpO2 percentage during sleep
- SpO2 breathing disturbances (if detected)

Normal SpO2 levels are typically 95-100%. Lower levels may indicate breathing issues during sleep.

Args:
  - start_date (string, required): Start date in YYYY-MM-DD format
  - end_date (string, optional): End date in YYYY-MM-DD format (defaults to today)
  - limit (number, optional): Max results to return (default: 50, max: 200)
  - response_format ('json' | 'markdown'): Output format (default: 'json')

Use when: User asks about blood oxygen, SpO2 levels, or breathing during sleep.`,
    inputSchema: GeneralOuraSchemaShape,
    annotations: readOnlyAnnotations,
  },
  async (args) => {
    try {
      const res = await oura.getDailySpo2(args);
      return {
        content: [
          {
            type: 'text',
            text: truncateResponse(formatDailySpo2(res, args.response_format)),
          },
        ],
      };
    } catch (error) {
      return errorToToolResult(error);
    }
  }
);

server.registerTool(
  'oura_get_daily_stress',
  {
    title: 'Get daily stress from Oura',
    description: `Fetch daily stress and recovery data from Oura Ring.

Returns stress metrics including:
- High stress time (minutes)
- Recovery time (minutes)
- Day summary (stressed, recovered, normal)
- Stress balance indicators

Stress is measured through heart rate variability (HRV) patterns. High recovery time indicates good parasympathetic nervous system activity.

Args:
  - start_date (string, required): Start date in YYYY-MM-DD format
  - end_date (string, optional): End date in YYYY-MM-DD format (defaults to today)
  - limit (number, optional): Max results to return (default: 50, max: 200)
  - response_format ('json' | 'markdown'): Output format (default: 'json')

Use when: User asks about stress levels, recovery, or daily stress patterns.`,
    inputSchema: GeneralOuraSchemaShape,
    annotations: readOnlyAnnotations,
  },
  async (args) => {
    try {
      const res = await oura.getDailyStress(args);
      return {
        content: [
          {
            type: 'text',
            text: truncateResponse(formatDailyStress(res, args.response_format)),
          },
        ],
      };
    } catch (error) {
      return errorToToolResult(error);
    }
  }
);

server.registerTool(
  'oura_get_heartrate',
  {
    title: 'Get heartrate from Oura',
    description: `Fetch heart rate time-series data from Oura Ring.

Returns heart rate readings including:
- BPM (beats per minute) measurements
- Timestamp for each reading
- Source of measurement (awake, sleep, rest, etc.)

Note: This endpoint returns detailed 5-second interval data which can be very large. Use 'markdown' format for a summary, or use short date ranges with 'json' for detailed data.

Args:
  - start_date (string, required): Start date in YYYY-MM-DD format
  - end_date (string, optional): End date in YYYY-MM-DD format (defaults to today)
  - limit (number, optional): Max results to return (default: 50, max: 200)
  - response_format ('json' | 'markdown'): Output format (default: 'json'). Use 'markdown' for summary stats.

Use when: User asks about heart rate, BPM, resting heart rate, or heart rate trends.`,
    inputSchema: GeneralOuraSchemaShape,
    annotations: readOnlyAnnotations,
  },
  async (args) => {
    try {
      const res = await oura.getHeartrate(args);
      return {
        content: [
          {
            type: 'text',
            text: truncateResponse(formatHeartrate(res, args.response_format)),
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
