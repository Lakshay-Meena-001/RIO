import axios from "axios";

// Centralized API client. Keep the existing base URL and cookie-auth behaviour.
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

// Coalesce only simultaneous identical GETs. This avoids duplicate network
// work when App, a page and the sidebar request the same resource together,
// without serving stale balances, prices, interview state, or other live data.
const inFlightGets = new Map();
let authGeneration = 0;
let dataGeneration = 0;

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
  const normalized = typeof headers.toJSON === "function" ? headers.toJSON() : headers;
  return JSON.stringify(
    Object.entries(normalized)
      .filter(([, value]) => value !== undefined && typeof value !== "function")
      .map(([key, value]) => [key.toLowerCase(), String(value)])
      .sort(([left], [right]) => left.localeCompare(right)),
  );
}

const originalGet = api.get.bind(api);

api.get = (url, config = {}) => {
  // Requests with cancellation/custom adapters should keep native Axios semantics.
  if (config.signal || config.adapter || config.skipDedupe) {
    return originalGet(url, config);
  }

  const key = [
    String(config.baseURL || api.defaults.baseURL || ""),
    String(url),
    stableParams(config.params),
    stableHeaders(config.headers),
    String(config.withCredentials ?? api.defaults.withCredentials ?? ""),
    String(config.responseType || ""),
    String(authGeneration),
    String(dataGeneration),
  ].join("|");

  const existing = inFlightGets.get(key);
  if (existing) return existing;

  const request = originalGet(url, config).finally(() => {
    if (inFlightGets.get(key) === request) inFlightGets.delete(key);
  });

  inFlightGets.set(key, request);
  return request;
};

// Prevent a GET started under one authentication state from being reused after
// login/logout or an authorization failure.
api.interceptors.request.use((config) => {
  const method = String(config.method || "get").toLowerCase();
  const url = String(config.url || "");

  // Never let a GET started before a write be reused after that write begins.
  // This is request coalescing only; responses are not persistently cached.
  if (!["get", "head", "options"].includes(method)) {
    dataGeneration += 1;
    inFlightGets.clear();
  }

  if (
    method !== "get" &&
    /(?:\/auth\/(?:login|logout|register|refresh)|\/(?:login|logout))(?:[/?]|$)/i.test(
      url,
    )
  ) {
    authGeneration += 1;
    inFlightGets.clear();
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if ([401, 403].includes(error?.response?.status)) {
      authGeneration += 1;
      inFlightGets.clear();
    }
    return Promise.reject(error);
  },
);

export default api;
