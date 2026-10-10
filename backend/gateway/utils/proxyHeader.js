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

      // Only explicitly configured internal services receive this secret.
      if (options.forwardInternalSecret) {
        const internalSecret = process.env.ROADMAP_INTERNAL_SECRET;

        if (!internalSecret) {
          throw new Error(
            "ROADMAP_INTERNAL_SECRET is required for this service",
          );
        }

        proxyReqOpts.headers["x-internal-service-secret"] = internalSecret;
      }

      return proxyReqOpts;
    },
  });
};
