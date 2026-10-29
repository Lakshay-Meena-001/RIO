import proxy from "express-http-proxy";

const timeoutCodes = new Set([
  "ETIMEDOUT",
  "ESOCKETTIMEDOUT",
  "ERR_SOCKET_TIMEOUT",
]);

export function proxyWithHeaders(
  serviceUrl,
  preservePath = false,
  options = {},
) {
  return proxy(serviceUrl, {
    ...(preservePath
      ? {
          proxyReqPathResolver: (req) => `${req.baseUrl}${req.url}`,
        }
      : {}),
    proxyReqOptDecorator(proxyRequestOptions, sourceRequest) {
      const headers = proxyRequestOptions.headers || {};
      proxyRequestOptions.headers = headers;

      delete headers["x-user-id"];
      delete headers["x-internal-service-secret"];

      const userId = sourceRequest.user?.userId;
      if (typeof userId !== "string" || !/^[a-f\d]{24}$/i.test(userId)) {
        const error = new Error("Authenticated user identity is missing.");
        error.code = "ERR_GATEWAY_IDENTITY";
        throw error;
      }

      headers["x-user-id"] = userId;
      headers["x-request-id"] = sourceRequest.requestId;

      if (options.forwardInternalSecret) {
        const secretName = options.internalSecretEnv;
        const secret = secretName ? process.env[secretName]?.trim() : "";

        if (!secret) {
          const error = new Error(
            `${secretName || "Internal service secret"} is not configured.`,
          );
          error.code = "ERR_GATEWAY_CONFIG";
          throw error;
        }

        headers["x-internal-service-secret"] = secret;
      }

      return proxyRequestOptions;
    },
    proxyErrorHandler(error, res, next) {
      if (res.headersSent) return next(error);

      if (error?.code === "ERR_GATEWAY_IDENTITY") {
        return res.status(401).json({
          success: false,
          error: {
            code: "AUTHENTICATION_REQUIRED",
            message: "Please sign in to continue.",
          },
          requestId: res.getHeader("x-request-id"),
        });
      }

      if (error?.code === "ERR_GATEWAY_CONFIG") {
        console.error("Gateway service configuration error:", error.message);
        return res.status(503).json({
          success: false,
          error: {
            code: "SERVICE_CONFIGURATION_ERROR",
            message: "This service is temporarily unavailable.",
          },
          requestId: res.getHeader("x-request-id"),
        });
      }

      const timedOut = timeoutCodes.has(error?.code);
      const status = timedOut ? 504 : 502;
      const code = timedOut ? "UPSTREAM_TIMEOUT" : "UPSTREAM_UNAVAILABLE";
      const message = timedOut
        ? "A dependent service did not respond in time."
        : "A dependent service is temporarily unavailable.";

      console.error("Gateway proxy request failed", {
        code: error?.code,
        message: error?.message,
      });

      return res.status(status).json({
        success: false,
        error: { code, message },
        requestId: res.getHeader("x-request-id"),
      });
    },
  });
}
