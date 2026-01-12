import { z } from 'zod';

/** Response format options */
export enum ResponseFormat {
  JSON = 'json',
  MARKDOWN = 'markdown',
}

/** Personal info data from Oura API */
export interface PersonalInfo {
  id?: string;
  age?: number;
  weight?: number;
  height?: number;
  biological_sex?: string;
  email?: string;
}

/** Paginated API response wrapper */
interface PaginatedResponse<T> {
  data: T[];
  next_token?: string;
}

/** Daily activity record */
interface DailyActivity {
  day: string;
  score?: number;
  active_calories?: number;
  total_calories?: number;
  steps?: number;
  equivalent_walking_distance?: number;
  high_activity_time?: number;
  medium_activity_time?: number;
  low_activity_time?: number;
}

/** Cardiovascular age record */
interface CardiovascularAge {
  day: string;
  vascular_age?: number;
}

/** Sleep contributors */
interface SleepContributors {
  deep_sleep?: number;
  efficiency?: number;
  latency?: number;
  rem_sleep?: number;
  restfulness?: number;
  timing?: number;
  total_sleep?: number;
}

/** Daily sleep record */
interface DailySleep {
  day: string;
  score?: number;
  contributors?: SleepContributors;
}

/** Daily SPO2 record */
interface DailySpo2 {
  day: string;
  spo2_percentage?: { average: number };
}

/** Daily stress record */
interface DailyStress {
  day: string;
  stress_high?: number;
  recovery_high?: number;
  day_summary?: string;
}

/** Heart rate record */
interface HeartrateRecord {
  bpm?: number;
}

/** Zod schema for response_format parameter */
export const responseFormatSchema = z
  .nativeEnum(ResponseFormat)
  .default(ResponseFormat.JSON)
  .describe(
    "Output format: 'json' for structured data or 'markdown' for human-readable summary",
  );

/** Format personal info data */
export function formatPersonalInfo(
  data: PersonalInfo,
  format: ResponseFormat,
): string {
  if (format === ResponseFormat.JSON) {
    return JSON.stringify(data, null, 2);
  }

  // Markdown format - concise summary
  const lines = ['# Personal Info', ''];
  if (data.id) lines.push(`- **ID**: ${data.id}`);
  if (data.age) lines.push(`- **Age**: ${data.age}`);
  if (data.weight) lines.push(`- **Weight**: ${data.weight} kg`);
  if (data.height) lines.push(`- **Height**: ${data.height} cm`);
  if (data.biological_sex)
    lines.push(`- **Biological Sex**: ${data.biological_sex}`);
  if (data.email) lines.push(`- **Email**: ${data.email}`);
  return lines.join('\n');
}

/** Format daily activity data */
export function formatDailyActivity(
  data: PaginatedResponse<DailyActivity>,
  format: ResponseFormat,
): string {
  if (format === ResponseFormat.JSON) {
    return JSON.stringify(data, null, 2);
  }

  const items = data.data || [];
  if (items.length === 0) {
    return '# Daily Activity\n\nNo activity data found for the specified date range.';
  }

  const lines = [
    '# Daily Activity',
    '',
    `Found ${items.length} day(s) of data.`,
    '',
  ];
  for (const day of items) {
    lines.push(`## ${day.day}`);
    if (day.score !== undefined) lines.push(`- **Score**: ${day.score}/100`);
    if (day.active_calories !== undefined)
      lines.push(`- **Active Calories**: ${day.active_calories} kcal`);
    if (day.total_calories !== undefined)
      lines.push(`- **Total Calories**: ${day.total_calories} kcal`);
    if (day.steps !== undefined)
      lines.push(`- **Steps**: ${day.steps.toLocaleString()}`);
    if (day.equivalent_walking_distance !== undefined)
      lines.push(
        `- **Distance**: ${(day.equivalent_walking_distance / 1000).toFixed(2)} km`,
      );
    if (day.high_activity_time !== undefined)
      lines.push(`- **High Activity**: ${day.high_activity_time} min`);
    if (day.medium_activity_time !== undefined)
      lines.push(`- **Medium Activity**: ${day.medium_activity_time} min`);
    if (day.low_activity_time !== undefined)
      lines.push(`- **Low Activity**: ${day.low_activity_time} min`);
    lines.push('');
  }
  if (data.next_token) {
    lines.push(`*More data available. Use next_token: ${data.next_token}*`);
  }
  return lines.join('\n');
}

/** Format cardiovascular age data */
export function formatCardiovascularAge(
  data: PaginatedResponse<CardiovascularAge>,
  format: ResponseFormat,
): string {
  if (format === ResponseFormat.JSON) {
    return JSON.stringify(data, null, 2);
  }

  const items = data.data || [];
  if (items.length === 0) {
    return '# Cardiovascular Age\n\nNo cardiovascular age data found for the specified date range.';
  }

  const lines = [
    '# Cardiovascular Age',
    '',
    `Found ${items.length} day(s) of data.`,
    '',
  ];
  for (const day of items) {
    lines.push(`## ${day.day}`);
    if (day.vascular_age !== undefined)
      lines.push(`- **Vascular Age**: ${day.vascular_age} years`);
    lines.push('');
  }
  return lines.join('\n');
}

/** Format daily sleep data */
export function formatDailySleep(
  data: PaginatedResponse<DailySleep>,
  format: ResponseFormat,
): string {
  if (format === ResponseFormat.JSON) {
    return JSON.stringify(data, null, 2);
  }

  const items = data.data || [];
  if (items.length === 0) {
    return '# Daily Sleep\n\nNo sleep data found for the specified date range.';
  }

  const lines = [
    '# Daily Sleep',
    '',
    `Found ${items.length} day(s) of data.`,
    '',
  ];
  for (const day of items) {
    lines.push(`## ${day.day}`);
    if (day.score !== undefined) lines.push(`- **Score**: ${day.score}/100`);
    if (day.contributors) {
      const c = day.contributors;
      if (c.deep_sleep !== undefined)
        lines.push(`- **Deep Sleep**: ${c.deep_sleep}/100`);
      if (c.efficiency !== undefined)
        lines.push(`- **Efficiency**: ${c.efficiency}/100`);
      if (c.latency !== undefined)
        lines.push(`- **Latency**: ${c.latency}/100`);
      if (c.rem_sleep !== undefined)
        lines.push(`- **REM Sleep**: ${c.rem_sleep}/100`);
      if (c.restfulness !== undefined)
        lines.push(`- **Restfulness**: ${c.restfulness}/100`);
      if (c.timing !== undefined) lines.push(`- **Timing**: ${c.timing}/100`);
      if (c.total_sleep !== undefined)
        lines.push(`- **Total Sleep**: ${c.total_sleep}/100`);
    }
    lines.push('');
  }
  if (data.next_token) {
    lines.push(`*More data available. Use next_token: ${data.next_token}*`);
  }
  return lines.join('\n');
}

/** Format SPO2 data */
export function formatDailySpo2(
  data: PaginatedResponse<DailySpo2>,
  format: ResponseFormat,
): string {
  if (format === ResponseFormat.JSON) {
    return JSON.stringify(data, null, 2);
  }

  const items = data.data || [];
  if (items.length === 0) {
    return '# Daily SPO2\n\nNo SPO2 data found for the specified date range.';
  }

  const lines = [
    '# Daily SPO2 (Blood Oxygen)',
    '',
    `Found ${items.length} day(s) of data.`,
    '',
  ];
  for (const day of items) {
    lines.push(`## ${day.day}`);
    if (day.spo2_percentage) {
      lines.push(`- **Average SPO2**: ${day.spo2_percentage.average}%`);
    }
    lines.push('');
  }
  return lines.join('\n');
}

/** Format daily stress data */
export function formatDailyStress(
  data: PaginatedResponse<DailyStress>,
  format: ResponseFormat,
): string {
  if (format === ResponseFormat.JSON) {
    return JSON.stringify(data, null, 2);
  }

  const items = data.data || [];
  if (items.length === 0) {
    return '# Daily Stress\n\nNo stress data found for the specified date range.';
  }

  const lines = [
    '# Daily Stress',
    '',
    `Found ${items.length} day(s) of data.`,
    '',
  ];
  for (const day of items) {
    lines.push(`## ${day.day}`);
    if (day.stress_high !== undefined)
      lines.push(`- **High Stress**: ${day.stress_high} min`);
    if (day.recovery_high !== undefined)
      lines.push(`- **High Recovery**: ${day.recovery_high} min`);
    if (day.day_summary !== undefined)
      lines.push(`- **Summary**: ${day.day_summary}`);
    lines.push('');
  }
  return lines.join('\n');
}

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

  // For markdown, provide a summary instead of all data points
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
