import "dotenv/config";
import { randomUUID } from "node:crypto";
import express from "express";
import proxy from "express-http-proxy";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { getCurrentUser } from "./controllers/userController.js";
import { isAuth } from "./middlewares/isAuth.js";
import { proxyWithHeaders } from "./utils/proxyHeader.js";

const app = express();
const isProduction = process.env.NODE_ENV === "production";
const port = Number(process.env.PORT || 3000);
const jsonBodyLimit = process.env.JSON_BODY_LIMIT || "1mb";

function serviceUrl(name, developmentFallback) {
  const configuredUrl = process.env[name]?.trim();

  if (!configuredUrl && isProduction) {
    throw new Error(`${name} must be configured in production.`);
  }

  const value = configuredUrl || developmentFallback;

  try {
    const parsedUrl = new URL(value);

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      throw new Error();
    }

    return value.replace(/\/$/, "");
  } catch {
    throw new Error(`${name} must be a valid HTTP or HTTPS URL.`);
  }
}

const services = {
  auth: serviceUrl("AUTH_SERVICE_URL", "http://localhost:6001"),
  resume: serviceUrl("RESUME_SERVICE_URL", "http://localhost:6002"),
  interview: serviceUrl("INTERVIEW_SERVICE_URL", "http://localhost:8003"),
  roadmap: serviceUrl("ROADMAP_SERVICE_URL", "http://localhost:8004"),
  billing: serviceUrl("BILLING_SERVICE_URL", "http://localhost:8005"),
};

const configuredOrigins = process.env.FRONTEND_URL?.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

if (isProduction && !configuredOrigins?.length) {
  throw new Error("FRONTEND_URL must be configured in production.");
}

const allowedOrigins = configuredOrigins?.length
  ? configuredOrigins
  : ["http://localhost:5173"];

app.disable("x-powered-by");
app.set("trust proxy", process.env.TRUST_PROXY === "true" ? 1 : false);

app.use((req, res, next) => {
  const suppliedId = req.get("x-request-id");
  const requestId =
    typeof suppliedId === "string" &&
    /^[a-zA-Z0-9._:-]{1,128}$/.test(suppliedId)
      ? suppliedId
      : randomUUID();

  req.requestId = requestId;
  res.setHeader("x-request-id", requestId);
  next();
});

app.use(
  cors({
    origin(origin, callback) {
      callback(null, !origin || allowedOrigins.includes(origin));
    },
    credentials: true,
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Request-Id"],
    exposedHeaders: ["X-Request-Id"],
  }),
);

app.use(express.json({ limit: jsonBodyLimit }));
app.use(cookieParser());
app.use(morgan(isProduction ? "combined" : "dev"));

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    service: "api-gateway",
    status: "healthy",
  });
});

app.use(
  "/api/auth",
  proxy(services.auth, {
    proxyErrorHandler: createProxyErrorHandler("Auth Service"),
    proxyReqOptDecorator: attachRequestId,
  }),
);

app.patch(
  "/api/profile",
  isAuth,
  proxy(services.auth, {
    proxyReqPathResolver: () => "/profile",
    proxyReqOptDecorator: attachTrustedHeaders,
    proxyErrorHandler: createProxyErrorHandler("Auth Service"),
  }),
);

app.use(
  "/api/resumes",
  isAuth,
  proxyWithHeaders(services.resume, true, {
    forwardInternalSecret: true,
    internalSecretEnv: "RESUME_INTERNAL_SECRET",
  }),
);

app.use(
  "/api/interview",
  isAuth,
  proxyWithHeaders(services.interview, true, {
    forwardInternalSecret: true,
    internalSecretEnv: "INTERVIEW_INTERNAL_SECRET",
  }),
);

app.use(
  "/api/roadmaps",
  isAuth,
  proxyWithHeaders(services.roadmap, true, {
    forwardInternalSecret: true,
    internalSecretEnv: "ROADMAP_INTERNAL_SECRET",
  }),
);

app.use(
  "/api/billing",
  isAuth,
  proxyWithHeaders(services.billing, false, {
    forwardInternalSecret: true,
    internalSecretEnv: "BILLING_INTERNAL_SECRET",
  }),
);

app.get("/api/me", isAuth, getCurrentUser);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: "GATEWAY_ROUTE_NOT_FOUND",
      message: "The requested API route was not found.",
    },
    requestId: req.requestId,
  });
});

app.use((error, req, res, _next) => {
  if (res.headersSent) return;

  if (error?.type === "entity.too.large") {
    return sendError(
      res,
      req,
      413,
      "REQUEST_TOO_LARGE",
      "The request body is too large.",
    );
  }

  if (error instanceof SyntaxError && "body" in error) {
    return sendError(
      res,
      req,
      400,
      "INVALID_JSON",
      "The request body contains invalid JSON.",
    );
  }

  if (error?.message === "CORS origin is not allowed") {
    return sendError(
      res,
      req,
      403,
      "ORIGIN_NOT_ALLOWED",
      "This origin is not allowed.",
    );
  }

  console.error("Gateway request failed", {
    requestId: req.requestId,
    method: req.method,
    path: req.originalUrl,
    error: error?.message,
  });

  return sendError(
    res,
    req,
    500,
    "INTERNAL_GATEWAY_ERROR",
    "An unexpected gateway error occurred.",
  );
});

function attachRequestId(proxyRequestOptions, sourceRequest) {
  proxyRequestOptions.headers = proxyRequestOptions.headers || {};
  proxyRequestOptions.headers["x-request-id"] = sourceRequest.requestId;
  return proxyRequestOptions;
}

function attachTrustedHeaders(proxyRequestOptions, sourceRequest) {
  proxyRequestOptions.headers = proxyRequestOptions.headers || {};
  delete proxyRequestOptions.headers["x-user-id"];
  delete proxyRequestOptions.headers["x-internal-service-secret"];

  const userId = sourceRequest.user?.userId;
  if (typeof userId === "string" && userId.trim()) {
    proxyRequestOptions.headers["x-user-id"] = userId.trim();
  }

  return attachRequestId(proxyRequestOptions, sourceRequest);
}

function createProxyErrorHandler(serviceName) {
  return (error, res, next) => {
    if (res.headersSent) return next(error);

    const timeoutCodes = new Set([
      "ETIMEDOUT",
      "ESOCKETTIMEDOUT",
      "ERR_SOCKET_TIMEOUT",
    ]);
    const status = timeoutCodes.has(error?.code) ? 504 : 502;
    const code = status === 504 ? "UPSTREAM_TIMEOUT" : "UPSTREAM_UNAVAILABLE";
    const message =
      status === 504
        ? "A dependent service did not respond in time."
        : "A dependent service is temporarily unavailable.";

    console.error("Gateway upstream request failed", {
      service: serviceName,
      code: error?.code,
      message: error?.message,
    });

    res.status(status).json({
      success: false,
      error: { code, message },
      requestId: res.getHeader("x-request-id") || randomUUID(),
    });
  };
}

function sendError(res, req, status, code, message) {
  return res.status(status).json({
    success: false,
    error: { code, message },
    requestId: req.requestId,
  });
}

const server = app.listen(port, () => {
  console.log(`API Gateway listening on port ${port}`);
});

server.requestTimeout = Number(process.env.REQUEST_TIMEOUT_MS || 30000);
server.headersTimeout = Number(process.env.HEADERS_TIMEOUT_MS || 15000);

let shuttingDown = false;

function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`API Gateway received ${signal}; shutting down.`);

  server.close((error) => {
    if (error) {
      console.error("API Gateway shutdown failed:", error.message);
      process.exitCode = 1;
      return;
    }

    console.log("API Gateway stopped.");
  });
}

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));

export default app;
