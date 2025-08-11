/**
 * Centralized service config resolver for dual-mode (local | remote)
 * - In local mode, API keys are required and Traefik headers are not used.
 * - In remote mode, API keys are not used and a single Traefik header pair may be attached.
 *
 * Services:
 *   - sab
 *   - sonarr
 *   - radarr
 *   - prowlarr
 *   - readarr
 *   - readarr_audiobooks
 *
 * Env schema (see docs/env.local.template.md for details)
 */

export type ServiceName =
  | 'sabnzbd'
  | 'sonarr'
  | 'radarr'
  | 'prowlarr'
  | 'readarr'
  | 'readarr_audiobooks';

export interface ServiceConfig {
  baseUrl: string;
  urlBase?: string;
  apiKey?: string;
  headers?: Record<string, string>;
}

const trim = (s?: string | null) => (s ?? '').trim();
const env = (k: string) => {
  const v = trim(process.env[k]);
  return v ? v : undefined;
};

const sanitizeBase = (u?: string) => {
  if (!u) return '';
  // Remove trailing slashes and whitespace artifacts
  return u.replace(/\s+/g, '').replace(/\/+$/, '');
};

const sanitizeUrlBase = (u?: string) => {
  if (!u) return undefined;
  const v = u.trim().replace(/^\/+|\/+$/g, '');
  return v.length ? v : undefined;
};

/**
 * Resolve config for a given service by reading the appropriate env variables
 * based on BACKEND_TARGET (defaults to 'local').
 *
 * Throws explicit errors when mandatory variables are missing to aid setup.
 */
export function resolveServiceConfig(service: ServiceName): ServiceConfig {
  const target = (env('BACKEND_TARGET') || 'local').toLowerCase();
  const isRemote = target === 'remote';
  const prefix = isRemote ? 'REMOTE' : 'LOCAL';

  const map: Record<ServiceName, { base: string; key?: string; urlBase?: string }> = {
    sabnzbd: {
      base: `${prefix}_SABNZBD_BASE_URL`,
      key: `${prefix}_SABNZBD_API_KEY`,
    },
    sonarr: {
      base: `${prefix}_SONARR_BASE_URL`,
      key: `${prefix}_SONARR_API_KEY`,
      urlBase: `${prefix}_SONARR_URL_BASE`,
    },
    radarr: {
      base: `${prefix}_RADARR_BASE_URL`,
      key: `${prefix}_RADARR_API_KEY`,
      urlBase: `${prefix}_RADARR_URL_BASE`,
    },
    prowlarr: {
      base: `${prefix}_PROWLARR_BASE_URL`,
      key: `${prefix}_PROWLARR_API_KEY`,
      urlBase: `${prefix}_PROWLARR_URL_BASE`,
    },
    readarr: {
      base: `${prefix}_READARR_BASE_URL`,
      key: `${prefix}_READARR_API_KEY`,
      urlBase: `${prefix}_READARR_URL_BASE`,
    },
    readarr_audiobooks: {
      base: `${prefix}_READARR_AUDIOBOOKS_BASE_URL`,
      key: `${prefix}_READARR_AUDIOBOOKS_API_KEY`,
      urlBase: `${prefix}_READARR_AUDIOBOOKS_URL_BASE`,
    },
  };

  const spec = map[service];
  const baseUrl = sanitizeBase(env(spec.base) || '');
  if (!baseUrl) {
    throw new Error(`Missing ${spec.base} for ${service} in ${prefix} mode`);
  }

  const cfg: ServiceConfig = { baseUrl };

  const ub = sanitizeUrlBase(spec.urlBase ? env(spec.urlBase) : undefined);
  if (ub) cfg.urlBase = ub;

  if (spec.key) {
    const keyVal = env(spec.key);
    if (!keyVal) {
      throw new Error(`Missing ${spec.key} for ${service} in LOCAL mode`);
    }
    cfg.apiKey = keyVal;
  }

  if (isRemote) {
    const hName = env('REMOTE_TRAEFIK_BYPASS_HEADER');
    const hVal = env('REMOTE_TRAEFIK_BYPASS_KEY');
    if (hName && hVal) {
      cfg.headers = { [hName]: hVal };
    }
  }

  return cfg;
}

/**
 * Build an Arr-style API URL: ${base}${/urlBase?}/api/{version}${pathname}
 * version: 'v3' (Sonarr/Radarr modern) or 'v1' (Prowlarr/Readarr)
 * The API key should be appended by the caller when operating in local mode.
 */
export function buildArrApiUrl(
  config: ServiceConfig,
  pathname: string,
  version: 'v3' | 'v1' = 'v3'
): URL {
  const base = sanitizeBase(config.baseUrl);
  const p = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const ub = sanitizeUrlBase(config.urlBase);
  const url = new URL(`${base}${ub ? `/${ub}` : ''}/api/${version}${p}`);
  return url;
}

/**
 * Build a SABnzbd API base URL: ${base}/sabnzbd/api
 * The API key should be appended by the caller when operating in local mode.
 */
export function buildSabApiUrl(config: ServiceConfig): URL {
  const base = sanitizeBase(config.baseUrl);
  return new URL(`${base}/sabnzbd/api`);
}

/**
 * Append all query params from src into dest URL.
 */
export function appendQueryParams(dest: URL, src: URLSearchParams): void {
  src.forEach((v, k) => dest.searchParams.append(k, v));
}

/**
 * Attach optional headers (e.g., Traefik) to a RequestInit.
 */
export function withOptionalHeaders(
  init: RequestInit | undefined,
  headers?: Record<string, string>
): RequestInit {
  if (!headers || Object.keys(headers).length === 0) return init || {};
  const next: RequestInit = { ...(init || {}) };
  const h = new Headers(next.headers || {});
  for (const [k, v] of Object.entries(headers)) {
    h.set(k, v);
  }
  next.headers = h;
  return next;
}