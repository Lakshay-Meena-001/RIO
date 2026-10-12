import proxy from "express-http-proxy";

export const proxyWithHeaders = (
  serviceUrl,
  preservePath = false,
  options = {},
) => {
  return proxy(serviceUrl, {
    ...(preservePath && {
      proxyReqPathResolver: (req) => {
        return req.baseUrl + req.url;
      },
    }),

    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      proxyReqOpts.headers = proxyReqOpts.headers || {};

      // Never trust client-supplied identity or internal-secret headers.
      delete proxyReqOpts.headers["x-user-id"];
      delete proxyReqOpts.headers["x-internal-service-secret"];

      // Forward identity only from the authenticated Gateway session.
      const userId = srcReq.user?.userId ?? srcReq.user?.id ?? srcReq.user?._id;

      if (userId != null && String(userId).trim()) {
        proxyReqOpts.headers["x-user-id"] = String(userId);
      }

      // Only explicitly configured internal services receive a secret.
      if (options.forwardInternalSecret) {
        const secretEnvName =
          options.internalSecretEnv || "ROADMAP_INTERNAL_SECRET";

        const internalSecret = process.env[secretEnvName];

        if (typeof internalSecret !== "string" || !internalSecret.trim()) {
          throw new Error(
            `${secretEnvName} is required for this internal service`,
          );
        }

        proxyReqOpts.headers["x-internal-service-secret"] = internalSecret;
      }

      return proxyReqOpts;
    },
  });
};
