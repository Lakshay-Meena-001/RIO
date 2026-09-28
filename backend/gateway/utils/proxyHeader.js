import proxy from "express-http-proxy";

export const proxyWithHeaders = (serviceUrl, preservePath = false) => {
  return proxy(serviceUrl, {
    ...(preservePath && {
      proxyReqPathResolver: (req) => {
        return req.baseUrl + req.url;
      },
    }),

    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      proxyReqOpts.headers = proxyReqOpts.headers || {};

      if (srcReq.user?.userId) {
        proxyReqOpts.headers["x-user-id"] = srcReq.user.userId;
      }

      return proxyReqOpts;
    },
  });
};
