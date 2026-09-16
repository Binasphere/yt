import { USE_BRIDGE } from './config';
import { bridgeApi } from './bridgeApi';
import { mockApi } from './mockApi';
import type { MpesaApi } from './types';

export const api: MpesaApi = USE_BRIDGE ? bridgeApi : mockApi;

export * from './types';
export { DEMO_AGENTS } from './mockApi';
export { withdrawalCharge } from './tariff';
export { BASE_URL, DEMO_PIN, POLL_INTERVAL } from './config';
/* pinAccepted moved to link.ts, which is where the handset's own PIN
   lives: after linking there is a right answer, and config has no way
   to know it. */
export { pinAccepted, isLinked, linkWithPin, loadToken, unlinkDevice } from './link';
export { refreshBridge } from './bridgeApi';
