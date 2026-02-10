import { type Got, got } from 'got';
import { z } from 'zod';
import { responseFormatSchema } from './formatters.ts';
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

// Date format regex for YYYY-MM-DD validation
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

// Default number of results to return
const DEFAULT_LIMIT = 50;

export const GeneralOuraSchemaShape = {
  start_date: z
    .string()
    .regex(dateRegex, 'Date must be in YYYY-MM-DD format')
    .describe('Start date in YYYY-MM-DD format (e.g., 2024-01-15)'),
  end_date: z
    .string()
    .regex(dateRegex, 'Date must be in YYYY-MM-DD format')
    .optional()
    .describe(
      'End date in YYYY-MM-DD format (defaults to today if not provided)',
    ),
  limit: z
    .number()
    .int('Limit must be a whole number')
    .min(1, 'Limit must be at least 1')
    .max(200, 'Limit cannot exceed 200')
    .default(DEFAULT_LIMIT)
    .describe(
      `Maximum number of results to return (default: ${DEFAULT_LIMIT}, max: 200)`,
    ),
  next_token: z.string().optional().describe('Next token to fetch next page'),
  response_format: responseFormatSchema,
};

export const GeneralOuraSchema = z.object(GeneralOuraSchemaShape);
export type GeneralOuraOptions = z.infer<typeof GeneralOuraSchema>;

/** Get today's date in YYYY-MM-DD format */
function getTodayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Apply request-time defaults to search params */
function withDefaults(
  params: GeneralOuraOptions,
): Record<string, string | number> {
  return {
    start_date: params.start_date,
    end_date: params.end_date ?? getTodayDate(),
    limit: params.limit ?? DEFAULT_LIMIT,
    ...(params.next_token ? { next_token: params.next_token } : {}),
  };
}

const ENDPOINTS = {
  personalInfo: 'usercollection/personal_info',
  dailyActivity: 'usercollection/daily_activity',
  dailyCardiovascularAge: 'usercollection/daily_cardiovascular_age',
  dailySleep: 'usercollection/daily_sleep',
  dailySpo2: 'usercollection/daily_spo2',
  dailyStress: 'usercollection/daily_stress',
  heartrate: 'usercollection/heartrate',
} as const;

export class Oura {
  private got: Got;

  constructor(apiKey: string) {
    this.got = got.extend({
      prefixUrl: 'https://api.ouraring.com/v2',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
  }

  private async fetch<T>(
    endpoint: string,
    label: string,
    searchParams?: Record<string, string | number>,
  ): Promise<T> {
    const request = this.got.get(endpoint, {
      ...(searchParams ? { searchParams } : {}),
    });

    const [res, json] = await Promise.all([request, request.json()]);

    if (!res.ok) {
      throw new Error(`Failed to get ${label}: ${res.statusCode}\n${res.body}`);
    }

    return json as T;
  }

  getPersonalInfo() {
    return this.fetch<PersonalInfo>(ENDPOINTS.personalInfo, 'personal info');
  }

  getDailyActivity(params: GeneralOuraOptions) {
    return this.fetch<PaginatedResponse<DailyActivity>>(
      ENDPOINTS.dailyActivity,
      'daily activity',
      withDefaults(params),
    );
  }

  getDailyCardiovascularAge(params: GeneralOuraOptions) {
    return this.fetch<PaginatedResponse<CardiovascularAge>>(
      ENDPOINTS.dailyCardiovascularAge,
      'daily cardiovascular age',
      withDefaults(params),
    );
  }

  getDailySleep(params: GeneralOuraOptions) {
    return this.fetch<PaginatedResponse<DailySleep>>(
      ENDPOINTS.dailySleep,
      'daily sleep',
      withDefaults(params),
    );
  }

  getDailySpo2(params: GeneralOuraOptions) {
    return this.fetch<PaginatedResponse<DailySpo2>>(
      ENDPOINTS.dailySpo2,
      'daily spo2',
      withDefaults(params),
    );
  }

  getDailyStress(params: GeneralOuraOptions) {
    return this.fetch<PaginatedResponse<DailyStress>>(
      ENDPOINTS.dailyStress,
      'daily stress',
      withDefaults(params),
    );
  }

  getHeartrate(params: GeneralOuraOptions) {
    return this.fetch<PaginatedResponse<HeartrateRecord>>(
      ENDPOINTS.heartrate,
      'heartrate',
      withDefaults(params),
    );
  }
}
