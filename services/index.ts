import { USE_BRIDGE } from './config';
import { bridgeApi } from './bridgeApi';
import { mockApi } from './mockApi';
import type { MpesaApi } from './types';

export const api: MpesaApi = USE_BRIDGE ? bridgeApi : mockApi;

export * from './types';
export { DEMO_AGENTS } from './mockApi';
export { withdrawalCharge } from './tariff';
export { BASE_URL, DEMO_PIN, POLL_INTERVAL, pinAccepted } from './config';
export { refreshBridge } from './bridgeApi';
