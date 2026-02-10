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
export interface PaginatedResponse<T> {
  data: T[];
  next_token?: string;
}

/** Daily activity record */
export interface DailyActivity {
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
export interface CardiovascularAge {
  day: string;
  vascular_age?: number;
}

/** Sleep contributors */
export interface SleepContributors {
  deep_sleep?: number;
  efficiency?: number;
  latency?: number;
  rem_sleep?: number;
  restfulness?: number;
  timing?: number;
  total_sleep?: number;
}

/** Daily sleep record */
export interface DailySleep {
  day: string;
  score?: number;
  contributors?: SleepContributors;
}

/** Daily SPO2 record */
export interface DailySpo2 {
  day: string;
  spo2_percentage?: { average: number };
}

/** Daily stress record */
export interface DailyStress {
  day: string;
  stress_high?: number;
  recovery_high?: number;
  day_summary?: string;
}

/** Heart rate record */
export interface HeartrateRecord {
  bpm?: number;
}
