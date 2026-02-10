import { z } from 'zod';
import type {
  CardiovascularAge,
  DailyActivity,
  DailySleep,
  DailySpo2,
  DailyStress,
  HeartrateRecord,
  PaginatedResponse,
  PersonalInfo,
} from './types.ts';
import { ResponseFormat } from './types.ts';

/** Zod schema for response_format parameter */
export const responseFormatSchema = z
  .nativeEnum(ResponseFormat)
  .default(ResponseFormat.JSON)
  .describe(
    "Output format: 'json' for structured data or 'markdown' for human-readable summary",
  );

/** Push a formatted field line if value is defined */
function field(
  lines: string[],
  label: string,
  value: unknown,
  suffix = '',
): void {
  if (value !== undefined) lines.push(`- **${label}**: ${value}${suffix}`);
}

/** Create a paginated formatter that handles JSON/empty/header/next_token boilerplate */
function makePaginatedFormatter<T extends { day: string }>(
  title: string,
  renderItem: (item: T, lines: string[]) => void,
): (data: PaginatedResponse<T>, format: ResponseFormat) => string {
  return (data, format) => {
    if (format === ResponseFormat.JSON) {
      return JSON.stringify(data, null, 2);
    }

    const items = data.data || [];
    if (items.length === 0) {
      return `# ${title}\n\nNo ${title.toLowerCase()} data found for the specified date range.`;
    }

    const lines = [
      `# ${title}`,
      '',
      `Found ${items.length} day(s) of data.`,
      '',
    ];
    for (const item of items) {
      lines.push(`## ${item.day}`);
      renderItem(item, lines);
      lines.push('');
    }
    if (data.next_token) {
      lines.push(`*More data available. Use next_token: ${data.next_token}*`);
    }
    return lines.join('\n');
  };
}

/** Format personal info data */
export function formatPersonalInfo(
  data: PersonalInfo,
  format: ResponseFormat,
): string {
  if (format === ResponseFormat.JSON) {
    return JSON.stringify(data, null, 2);
  }

  const lines = ['# Personal Info', ''];
  field(lines, 'ID', data.id);
  field(lines, 'Age', data.age);
  field(lines, 'Weight', data.weight, ' kg');
  field(lines, 'Height', data.height, ' cm');
  field(lines, 'Biological Sex', data.biological_sex);
  field(lines, 'Email', data.email);
  return lines.join('\n');
}

/** Format daily activity data */
export const formatDailyActivity = makePaginatedFormatter<DailyActivity>(
  'Daily Activity',
  (day, lines) => {
    field(lines, 'Score', day.score, '/100');
    field(lines, 'Active Calories', day.active_calories, ' kcal');
    field(lines, 'Total Calories', day.total_calories, ' kcal');
    if (day.steps !== undefined)
      lines.push(`- **Steps**: ${day.steps.toLocaleString()}`);
    if (day.equivalent_walking_distance !== undefined)
      lines.push(
        `- **Distance**: ${(day.equivalent_walking_distance / 1000).toFixed(2)} km`,
      );
    field(lines, 'High Activity', day.high_activity_time, ' min');
    field(lines, 'Medium Activity', day.medium_activity_time, ' min');
    field(lines, 'Low Activity', day.low_activity_time, ' min');
  },
);

/** Format cardiovascular age data */
export const formatCardiovascularAge =
  makePaginatedFormatter<CardiovascularAge>(
    'Cardiovascular Age',
    (day, lines) => {
      field(lines, 'Vascular Age', day.vascular_age, ' years');
    },
  );

/** Format daily sleep data */
export const formatDailySleep = makePaginatedFormatter<DailySleep>(
  'Daily Sleep',
  (day, lines) => {
    field(lines, 'Score', day.score, '/100');
    if (day.contributors) {
      const c = day.contributors;
      field(lines, 'Deep Sleep', c.deep_sleep, '/100');
      field(lines, 'Efficiency', c.efficiency, '/100');
      field(lines, 'Latency', c.latency, '/100');
      field(lines, 'REM Sleep', c.rem_sleep, '/100');
      field(lines, 'Restfulness', c.restfulness, '/100');
      field(lines, 'Timing', c.timing, '/100');
      field(lines, 'Total Sleep', c.total_sleep, '/100');
    }
  },
);

/** Format SPO2 data */
export const formatDailySpo2 = makePaginatedFormatter<DailySpo2>(
  'Daily SPO2',
  (day, lines) => {
    if (day.spo2_percentage) {
      lines.push(`- **Average SPO2**: ${day.spo2_percentage.average}%`);
    }
  },
);

/** Format daily stress data */
export const formatDailyStress = makePaginatedFormatter<DailyStress>(
  'Daily Stress',
  (day, lines) => {
    field(lines, 'High Stress', day.stress_high, ' min');
    field(lines, 'High Recovery', day.recovery_high, ' min');
    field(lines, 'Summary', day.day_summary);
  },
);

/** Format heartrate data */
export function formatHeartrate(
  data: PaginatedResponse<HeartrateRecord>,
  format: ResponseFormat,
): string {
  if (format === ResponseFormat.JSON) {
    return JSON.stringify(data, null, 2);
  }

  const items = data.data || [];
  if (items.length === 0) {
    return '# Heart Rate\n\nNo heart rate data found for the specified date range.';
  }

  const bpms = items
    .map((d) => d.bpm)
    .filter((b): b is number => b !== undefined);
  const minBpm = Math.min(...bpms);
  const maxBpm = Math.max(...bpms);
  const avgBpm = Math.round(
    bpms.reduce((a: number, b: number) => a + b, 0) / bpms.length,
  );

  const lines = [
    '# Heart Rate Summary',
    '',
    `**Data Points**: ${items.length.toLocaleString()}`,
    `**Average BPM**: ${avgBpm}`,
    `**Min BPM**: ${minBpm}`,
    `**Max BPM**: ${maxBpm}`,
    '',
  ];

  if (data.next_token) {
    lines.push(`*More data available. Use next_token: ${data.next_token}*`);
  }
  lines.push(
    '',
    '*Note: Use response_format="json" for detailed time-series data.*',
  );
  return lines.join('\n');
}
