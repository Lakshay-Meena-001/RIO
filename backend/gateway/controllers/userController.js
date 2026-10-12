import "dotenv/config";

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL;
const AUTH_INTERNAL_SECRET = process.env.AUTH_INTERNAL_SECRET;

export const getCurrentUser = async (req, res) => {
  try {
    // The identity comes from the authenticated server-side session.
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    // Fail closed when internal service authentication is not configured.
    if (
      !AUTH_SERVICE_URL ||
      typeof AUTH_INTERNAL_SECRET !== "string" ||
      !AUTH_INTERNAL_SECRET.trim()
    ) {
      console.error("Auth Service configuration is missing in API Gateway.");

      return res.status(503).json({
        success: false,
        message: "User information is temporarily unavailable.",
      });
    }

    // Ask Auth Service for the authoritative MongoDB balance.
    const response = await fetch(`${AUTH_SERVICE_URL}/internal/user-balance`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-service-secret": AUTH_INTERNAL_SECRET,
        "x-user-id": userId,
      },
      body: "{}",
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      if (response.status === 404) {
        return res.status(404).json({
          success: false,
          message: "User account not found.",
        });
      }

      console.error(
        `Auth Service balance lookup failed with status ${response.status}.`,
      );

      return res.status(503).json({
        success: false,
        message: "User information is temporarily unavailable.",
      });
    }

    const balanceData = await response.json();
    const balance = balanceData?.balance;

    // Never return an invalid or malformed balance as valid account data.
    if (
      balanceData?.success !== true ||
      !Number.isSafeInteger(balance) ||
      balance < 0
    ) {
      console.error("Auth Service returned an invalid balance response.");

      return res.status(502).json({
        success: false,
        message: "Unable to verify the current account balance.",
      });
    }

    // Preserve the existing session-backed profile fields,
    // but always use the latest verified balance.
    return res.status(200).json({
      success: true,
      user: {
        ...req.user,
        balance,
      },
    });
  } catch (error) {
    if (error.name === "TimeoutError" || error.name === "AbortError") {
      return res.status(504).json({
        success: false,
        message: "User information request timed out.",
      });
    }

    console.error("Get Current User Error:", error);

    return res.status(503).json({
      success: false,
      message: "User information is temporarily unavailable.",
    });
  }
};
