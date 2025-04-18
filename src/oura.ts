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
}
