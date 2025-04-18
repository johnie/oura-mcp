import { got, type Got } from 'got';
import { z } from 'zod';

export const GeneralOuraSchema = {
  start_date: z.string().datetime().describe('Start date to fetch data'),
  end_date: z
    .string()
    .datetime()
    .default(new Date().toISOString())
    .describe('End date to fetch data'),
  next_token: z.string().optional().describe('Next token to fetch next page'),
};

type GeneralOuraOptions = z.infer<z.ZodObject<typeof GeneralOuraSchema>>;

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
        `Failed to get personal info: ${res.statusCode}\n${res.body}`
      );
    }

    return json;
  }

  async getDailyActivity(searchParams: GeneralOuraOptions) {
    const request = this.got.get('usercollection/daily_activity', {
      searchParams,
    });

    const [res, json] = await Promise.all([request, request.json()]);

    if (!res.ok) {
      throw new Error(
        `Failed to get daily activity: ${res.statusCode}\n${res.body}`
      );
    }

    return json;
  }

  async getDailyCardiovascularAge(searchParams: GeneralOuraOptions) {
    const request = this.got.get('usercollection/daily_cardiovascular_age', {
      searchParams,
    });

    const [res, json] = await Promise.all([request, request.json()]);

    if (!res.ok) {
      throw new Error(
        `Failed to get daily cardiovascular age: ${res.statusCode}\n${res.body}`
      );
    }

    return json;
  }

  async getDailySleep(searchParams: GeneralOuraOptions) {
    const request = this.got.get('usercollection/daily_sleep', {
      searchParams,
    });

    const [res, json] = await Promise.all([request, request.json()]);

    if (!res.ok) {
      throw new Error(
        `Failed to get daily sleep: ${res.statusCode}\n${res.body}`
      );
    }

    return json;
  }

  async getDailySpo2(searchParams: GeneralOuraOptions) {
    const request = this.got.get('usercollection/daily_spo2', {
      searchParams,
    });

    const [res, json] = await Promise.all([request, request.json()]);

    if (!res.ok) {
      throw new Error(
        `Failed to get daily spo2: ${res.statusCode}\n${res.body}`
      );
    }

    return json;
  }

  async getDailyStress(searchParams: GeneralOuraOptions) {
    const request = this.got.get('usercollection/daily_stress', {
      searchParams,
    });

    const [res, json] = await Promise.all([request, request.json()]);

    if (!res.ok) {
      throw new Error(
        `Failed to get daily stress: ${res.statusCode}\n${res.body}`
      );
    }

    return json;
  }

  async getHeartrate(searchParams: GeneralOuraOptions) {
    const request = this.got.get('usercollection/heartrate', {
      searchParams,
    });

    const [res, json] = await Promise.all([request, request.json()]);

    if (!res.ok) {
      throw new Error(
        `Failed to get heartrate: ${res.statusCode}\n${res.body}`
      );
    }

    return json;
  }
}
