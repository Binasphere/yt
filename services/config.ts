/**
 * Single switch between demo data and the real backend.
 *
 * When your backend is ready:
 *   1. set USE_MOCK = false
 *   2. point BASE_URL at your server (use your LAN IP, not localhost —
 *      Expo Go runs on the phone, so "localhost" would mean the phone itself)
 */
export const USE_MOCK = true;

export const BASE_URL = 'http://192.168.1.100:4000';

/** Simulated network latency for the mock adapter, in ms. */
export const MOCK_LATENCY = 650;

/** The PIN the mock adapter accepts. */
export const DEMO_PIN = '1234';
