import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { PersonalInfo } from './formatters';
import {
  formatCardiovascularAge,
  formatDailyActivity,
  formatDailySleep,
  formatDailySpo2,
  formatDailyStress,
  formatHeartrate,
  formatPersonalInfo,
  ResponseFormat,
  responseFormatSchema,
} from './formatters';
import type { GeneralOuraOptions, Oura } from './oura';
import { GeneralOuraSchemaShape } from './oura';
import { errorToToolResult, truncateResponse } from './utils';

// Standard annotations for read-only Oura data tools
const readOnlyAnnotations = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: true,
};

type OuraMethod = (params: GeneralOuraOptions) => Promise<unknown>;
type Formatter = (data: unknown, format: ResponseFormat) => string;

interface ToolDefinition {
  name: string;
  title: string;
  description: string;
  method: OuraMethod;
  formatter: Formatter;
}

/**
 * Register a standard Oura data tool with the MCP server.
 * Handles common logic: error handling, formatting, truncation.
 */
function registerOuraTool(server: McpServer, oura: Oura, tool: ToolDefinition) {
  server.registerTool(
    tool.name,
    {
      title: tool.title,
      description: tool.description,
      inputSchema: GeneralOuraSchemaShape,
      annotations: readOnlyAnnotations,
    },
    async (args) => {
      try {
        const res = await tool.method.call(oura, args);
        return {
          content: [
            {
              type: 'text',
              text: truncateResponse(tool.formatter(res, args.response_format)),
            },
          ],
        };
      } catch (error) {
        return errorToToolResult(error);
      }
    },
  );
}

/**
 * Register all Oura tools with the MCP server.
 */
export function registerAllTools(server: McpServer, oura: Oura) {
  // Personal info tool (different schema - no date params)
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
              text: truncateResponse(
                formatPersonalInfo(res as PersonalInfo, format),
              ),
            },
          ],
        };
      } catch (error) {
        return errorToToolResult(error);
      }
    },
  );

  // Standard data tools using factory pattern
  const tools: ToolDefinition[] = [
    {
      name: 'oura_get_daily_activity',
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
      method: oura.getDailyActivity,
      formatter: formatDailyActivity as Formatter,
    },
    {
      name: 'oura_get_daily_cardiovascular_age',
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
      method: oura.getDailyCardiovascularAge,
      formatter: formatCardiovascularAge as Formatter,
    },
    {
      name: 'oura_get_daily_sleep',
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
      method: oura.getDailySleep,
      formatter: formatDailySleep as Formatter,
    },
    {
      name: 'oura_get_daily_spo2',
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
      method: oura.getDailySpo2,
      formatter: formatDailySpo2 as Formatter,
    },
    {
      name: 'oura_get_daily_stress',
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
      method: oura.getDailyStress,
      formatter: formatDailyStress as Formatter,
    },
    {
      name: 'oura_get_heartrate',
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
      method: oura.getHeartrate,
      formatter: formatHeartrate as Formatter,
    },
  ];

  // Register all standard tools
  for (const tool of tools) {
    registerOuraTool(server, oura, tool);
  }
}
