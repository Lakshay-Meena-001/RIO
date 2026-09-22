import redis from "";
export const auth = async (req, res, next) => {
  try {
    const sessionId = req.cookies?.session;

    if (!sessionId) {
      return res.status(401).JSON({
        message: "Unauthorized Access",
      });
    }

    const session = redis.get(`session:${sessionId}`);

    if (!session) {
      return res.status(401).JSON({
        message: "Session Expired",
      });
    }

    req.user = JSON.parse(session);
    next();
  } catch (error) {
    return res.status(400)
  }
};
