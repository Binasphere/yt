import { USE_MOCK } from './config';
import { httpApi } from './httpApi';
import { mockApi } from './mockApi';
import type { MpesaApi } from './types';

export const api: MpesaApi = USE_MOCK ? mockApi : httpApi;

export * from './types';
export { DEMO_AGENTS } from './mockApi';
export { withdrawalCharge } from './tariff';
export { DEMO_PIN } from './config';
