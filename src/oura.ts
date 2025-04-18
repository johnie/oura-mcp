import { got, type Got } from 'got';
import { z } from 'zod';

export class Raindrop {
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
}
