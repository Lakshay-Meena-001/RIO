import redis from "../../shared/redis/redis.js";

export const isAuth = async (req, res, next) => {
  try {
    const sessionId = req.cookies?.session;

    if (!sessionId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    const session = await redis.get(`session:${sessionId}`);

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Session expired",
      });
    }

    req.user = JSON.parse(session);

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);

    return res.status(500).json({
      success: false,
      message: "Authentication failed",
    });
  }
};
