import axios from "axios";

// Shared API client. Keep the existing gateway URL and auth behaviour.
const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();

if (import.meta.env.PROD && !configuredApiUrl) {
  throw new Error(
    "VITE_API_URL must be configured for production builds to reach the API Gateway.",
  );
}

const api = axios.create({
  baseURL: configuredApiUrl || "http://localhost:3000",
  withCredentials: true,
});

// Per-tab, per-auth-session cache. React page unmounts do not clear this map.
const responseCache = new Map();
const inFlightGets = new Map();
const DEFAULT_CACHE_TTL_MS = 5 * 60 * 1000;
const MAX_CACHE_ENTRIES = 300;
let authGeneration = 0;

function stableObject(value) {
  if (!value || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(stableObject);
  return Object.keys(value)
    .sort()
    .reduce((result, key) => {
      const item = value[key];
      if (typeof item !== "function" && item !== undefined) {
        result[key] = stableObject(item);
      }
      return result;
    }, {});
}

function stableParams(params) {
  if (!params || typeof params !== "object") return String(params ?? "");
  return JSON.stringify(stableObject(params));
}

function stableHeaders(headers) {
  if (!headers) return "";
  const normalized =
    typeof headers.toJSON === "function" ? headers.toJSON() : headers;
  return JSON.stringify(
    Object.entries(normalized)
      .filter(([, value]) => value !== undefined && typeof value !== "function")
      .map(([key, value]) => [key.toLowerCase(), String(value)])
      .sort(([left], [right]) => left.localeCompare(right)),
  );
}

function isCacheableGet(url, config = {}) {
  if (
    config.signal ||
    config.adapter ||
    config.skipCache ||
    config.skipDedupe ||
    config.responseType === "stream"
  )
    return false;

  const path = String(url || "").toLowerCase();
  // Exclude only genuinely volatile/security-sensitive reads. Do NOT exclude
  // whole billing/interview modules: history and summaries are stable reads.
  return (
    !/(?:^|\/)auth\/(?:login|logout|register|refresh)(?:\/|\?|$)/i.test(path) &&
    !/(?:^|\/)(?:login|logout|register|refresh|timer|notifications?)(?:\/|\?|$)/i.test(
      path,
    ) &&
    !/\/transactions\/pending(?:\/|\?|$)/i.test(path)
  );
}

function cacheKey(url, config = {}) {
  return [
    String(config.baseURL || api.defaults.baseURL || ""),
    String(url),
    stableParams(config.params),
    stableHeaders(config.headers),
    String(config.withCredentials ?? api.defaults.withCredentials ?? ""),
    String(config.responseType || ""),
    String(authGeneration),
  ].join("|");
}

function storeResponse(key, response, config = {}) {
  if (response.status < 200 || response.status >= 300) return;
  const cacheControl = String(
    response.headers?.["cache-control"] || "",
  ).toLowerCase();
  // `private` is safe here: this cache lives only in this tab and is cleared
  // on auth changes. `no-store` must still be respected.
  if (/no-store/.test(cacheControl)) return;

  const requestedTtl = Number(config.cacheTTL);
  const ttl =
    Number.isFinite(requestedTtl) && requestedTtl >= 0
      ? requestedTtl
      : DEFAULT_CACHE_TTL_MS;
  if (ttl === 0) return;

  responseCache.delete(key);
  responseCache.set(key, { response, expiresAt: Date.now() + ttl });
  while (responseCache.size > MAX_CACHE_ENTRIES) {
    responseCache.delete(responseCache.keys().next().value);
  }
}

function clearAllCache() {
  responseCache.clear();
  inFlightGets.clear();
}

function cacheDomain(url) {
  const path = String(url || "").toLowerCase();
  if (/resume/.test(path)) return "resume";
  if (/roadmap/.test(path)) return "roadmap";
  if (/interview/.test(path)) return "interview";
  if (/billing|transaction|payment/.test(path)) return "billing";
  if (/profile|user|account|setting/.test(path)) return "user";
  return null;
}

function invalidateDomain(domain) {
  if (!domain) {
    clearAllCache();
    return;
  }
  for (const key of responseCache.keys()) {
    if (
      key.toLowerCase().includes(`/api/${domain}`) ||
      (domain === "billing" && /billing|transaction|payment/i.test(key)) ||
      (domain === "user" && /profile|user|account|setting/i.test(key))
    ) {
      responseCache.delete(key);
    }
  }
  for (const key of inFlightGets.keys()) {
    if (
      key.toLowerCase().includes(`/api/${domain}`) ||
      (domain === "billing" && /billing|transaction|payment/i.test(key)) ||
      (domain === "user" && /profile|user|account|setting/i.test(key))
    ) {
      inFlightGets.delete(key);
    }
  }
}

export function invalidateApiCache(domain) {
  if (domain) invalidateDomain(domain);
  else clearAllCache();
}

const originalGet = api.get.bind(api);
api.get = (url, config = {}) => {
  if (!isCacheableGet(url, config)) return originalGet(url, config);

  const key = cacheKey(url, config);
  const cached = responseCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    responseCache.delete(key);
    responseCache.set(key, cached);
    return Promise.resolve({ ...cached.response, config });
  }
  if (cached) responseCache.delete(key);

  const existing = inFlightGets.get(key);
  if (existing) return existing;

  const request = originalGet(url, config)
    .then((response) => {
      storeResponse(key, response, config);
      return response;
    })
    .finally(() => {
      if (inFlightGets.get(key) === request) inFlightGets.delete(key);
    });

  inFlightGets.set(key, request);
  return request;
};

api.interceptors.request.use((config) => {
  const method = String(config.method || "get").toLowerCase();
  const url = String(config.url || "");

  if (!["get", "head", "options"].includes(method)) {
    // Invalidate only the data domain changed by this mutation. This prevents
    // unrelated writes from flushing every page's cached responses.
    if (
      /\/auth\/(?:login|logout|register|refresh)|\/(?:login|logout)(?:[/?]|$)/i.test(
        url,
      )
    ) {
      authGeneration += 1;
      clearAllCache();
    } else {
      invalidateDomain(cacheDomain(url));
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if ([401, 403].includes(error?.response?.status)) {
      authGeneration += 1;
      clearAllCache();
    }
    return Promise.reject(error);
  },
);

export default api;
