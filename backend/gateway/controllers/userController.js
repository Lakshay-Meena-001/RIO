import "dotenv/config";

const requestTimeoutMs = Number(process.env.AUTH_REQUEST_TIMEOUT_MS || 5000);

export async function getCurrentUser(req, res) {
  const userId = req.user?.userId;

  if (typeof userId !== "string" || !/^[a-f\d]{24}$/i.test(userId)) {
    return res.status(401).json({
      success: false,
      error: {
        code: "AUTHENTICATION_REQUIRED",
        message: "Please sign in to continue.",
      },
      requestId: req.requestId,
    });
  }

  const authServiceUrl =
    process.env.AUTH_SERVICE_URL?.trim() || "http://localhost:8001";
  const internalSecret = process.env.AUTH_INTERNAL_SECRET?.trim();

  if (!internalSecret) {
    console.error("AUTH_INTERNAL_SECRET is not configured.");
    return sendError(
      res,
      req,
      503,
      "SERVICE_CONFIGURATION_ERROR",
      "User information is temporarily unavailable.",
    );
  }

  try {
    const response = await fetch(
      `${authServiceUrl.replace(/\/$/, "")}/internal/user-balance`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-internal-service-secret": internalSecret,
          "x-user-id": userId,
          "x-request-id": req.requestId,
        },
        body: "{}",
        signal: AbortSignal.timeout(requestTimeoutMs),
      },
    );

    if (response.status === 404) {
      return sendError(
        res,
        req,
        404,
        "USER_NOT_FOUND",
        "The user account could not be found.",
      );
    }

    if (!response.ok) {
      console.error("Auth Service user lookup failed", {
        requestId: req.requestId,
        status: response.status,
      });
      return sendError(
        res,
        req,
        502,
        "AUTH_SERVICE_ERROR",
        "User information is temporarily unavailable.",
      );
    }

    let data;
    try {
      data = await response.json();
    } catch {
      return sendError(
        res,
        req,
        502,
        "INVALID_AUTH_SERVICE_RESPONSE",
        "User information is temporarily unavailable.",
      );
    }

    const balance = data?.balance;
    if (
      data?.success !== true ||
      !Number.isSafeInteger(balance) ||
      balance < 0
    ) {
      console.error("Auth Service returned an invalid user balance response.", {
        requestId: req.requestId,
      });
      return sendError(
        res,
        req,
        502,
        "INVALID_AUTH_SERVICE_RESPONSE",
        "User information is temporarily unavailable.",
      );
    }

    return res.status(200).json({
      success: true,
      user: { ...req.user, balance },
      requestId: req.requestId,
    });
  } catch (error) {
    const timedOut = ["TimeoutError", "AbortError"].includes(error?.name);
    const status = timedOut ? 504 : 503;
    const code = timedOut ? "AUTH_SERVICE_TIMEOUT" : "AUTH_SERVICE_UNAVAILABLE";
    const message = timedOut
      ? "User information request timed out."
      : "User information is temporarily unavailable.";

    console.error("Auth Service user lookup failed", {
      requestId: req.requestId,
      error: error?.message,
    });

    return sendError(res, req, status, code, message);
  }
}

function sendError(res, req, status, code, message) {
  return res.status(status).json({
    success: false,
    error: { code, message },
    requestId: req.requestId,
  });
}
