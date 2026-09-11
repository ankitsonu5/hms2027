/**
 * Every API call is relative to the origin that served the app.
 *
 * - Production: NestJS serves this Angular build and the API from one origin,
 *   so `/api/v1` hits the same server with no host or port baked in.
 * - Local dev: `ng serve` forwards `/api` to the backend via proxy.conf.json.
 *
 * Keep this the only place the API path is defined.
 */
export const API_BASE = '/api/v1';
