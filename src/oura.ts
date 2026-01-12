import { type Got, got } from 'got';
import { z } from 'zod';
import { responseFormatSchema } from './formatters';

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

export class Oura {
  got: Got;

  constructor(apiKey: string) {
    this.got = got.extend({
      prefixUrl: 'https://api.ouraring.com/v2',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
  }

  async getPersonalInfo() {
    const request = this.got.get('usercollection/personal_info');

    const [res, json] = await Promise.all([request, request.json()]);

    if (!res.ok) {
      throw new Error(
        `Failed to get personal info: ${res.statusCode}\n${res.body}`,
      );
    }

    return json;
  }

  async getDailyActivity(searchParams: GeneralOuraOptions) {
    const request = this.got.get('usercollection/daily_activity', {
      searchParams: withDefaults(searchParams),
    });

    const [res, json] = await Promise.all([request, request.json()]);

    if (!res.ok) {
      throw new Error(
        `Failed to get daily activity: ${res.statusCode}\n${res.body}`,
      );
    }

    return json;
  }

  async getDailyCardiovascularAge(searchParams: GeneralOuraOptions) {
    const request = this.got.get('usercollection/daily_cardiovascular_age', {
      searchParams: withDefaults(searchParams),
    });

    const [res, json] = await Promise.all([request, request.json()]);

    if (!res.ok) {
      throw new Error(
        `Failed to get daily cardiovascular age: ${res.statusCode}\n${res.body}`,
      );
    }

    return json;
  }

  async getDailySleep(searchParams: GeneralOuraOptions) {
    const request = this.got.get('usercollection/daily_sleep', {
      searchParams: withDefaults(searchParams),
    });

    const [res, json] = await Promise.all([request, request.json()]);

    if (!res.ok) {
      throw new Error(
        `Failed to get daily sleep: ${res.statusCode}\n${res.body}`,
      );
    }

    return json;
  }

  async getDailySpo2(searchParams: GeneralOuraOptions) {
    const request = this.got.get('usercollection/daily_spo2', {
      searchParams: withDefaults(searchParams),
    });

    const [res, json] = await Promise.all([request, request.json()]);

    if (!res.ok) {
      throw new Error(
        `Failed to get daily spo2: ${res.statusCode}\n${res.body}`,
      );
    }

    return json;
  }

  async getDailyStress(searchParams: GeneralOuraOptions) {
    const request = this.got.get('usercollection/daily_stress', {
      searchParams: withDefaults(searchParams),
    });

    const [res, json] = await Promise.all([request, request.json()]);

    if (!res.ok) {
      throw new Error(
        `Failed to get daily stress: ${res.statusCode}\n${res.body}`,
      );
    }

    return json;
  }

  async getHeartrate(searchParams: GeneralOuraOptions) {
    const request = this.got.get('usercollection/heartrate', {
      searchParams: withDefaults(searchParams),
    });

    const [res, json] = await Promise.all([request, request.json()]);

    if (!res.ok) {
      throw new Error(
        `Failed to get heartrate: ${res.statusCode}\n${res.body}`,
      );
    }

    return json;
  }
}
