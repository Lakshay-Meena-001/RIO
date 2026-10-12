import { beforeEach, describe, expect, it, vi } from "vitest";
import { getCurrentUser } from "../controllers/auth.controller.js";

const { verifyIdTokenMock } = vi.hoisted(() => ({
  verifyIdTokenMock: vi.fn(),
}));

vi.mock("firebase-admin/auth", () => ({
  getAuth: () => ({
    verifyIdToken: verifyIdTokenMock,
  }),
}));

vi.mock("../config/firebase.js", () => ({
  app: {},
}));

vi.mock("../models/user.model.js", () => ({
  default: {
    findOne: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock("../../../shared/redis/redis.js", () => ({
  default: {
    set: vi.fn(),
    sadd: vi.fn(),
    expire: vi.fn(),
    smembers: vi.fn(),
  },
}));

vi.mock("../models/balance-transaction.model.js", () => ({
  default: {},
}));

import { googleAuth } from "../controllers/auth.controller.js";

const createResponse = () => {
  const res = {
    status: vi.fn(),
    json: vi.fn(),
    cookie: vi.fn(),
  };

  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);
  res.cookie.mockReturnValue(res);

  return res;
};

describe("Google authentication", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should reject a missing token with 400", async () => {
    const req = { body: {} };
    const res = createResponse();

    await googleAuth(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(verifyIdTokenMock).not.toHaveBeenCalled();
  });

  it("should reject an invalid Firebase token with 401", async () => {
    verifyIdTokenMock.mockRejectedValueOnce({
      code: "auth/invalid-id-token",
    });

    const req = { body: { token: "invalid-token" } };
    const res = createResponse();

    await googleAuth(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("should reject an unverified email/password account with 403", async () => {
    verifyIdTokenMock.mockResolvedValueOnce({
      uid: "firebase-user-1",
      email: "test@example.com",
      email_verified: false,
      firebase: {
        sign_in_provider: "password",
      },
    });

    const req = {
      body: { token: "valid-token-but-unverified-email" },
    };
    const res = createResponse();

    await googleAuth(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        code: "EMAIL_NOT_VERIFIED",
      }),
    );
  });

  it("should return 500 when Firebase verification fails unexpectedly", async () => {
    verifyIdTokenMock.mockRejectedValueOnce(
      new Error("Unexpected Firebase failure"),
    );

    const req = { body: { token: "valid-looking-token" } };
    const res = createResponse();

    await googleAuth(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("Current user authentication", () => {
  it("should reject a request without a session with 401", async () => {
    const req = { cookies: {} };
    const res = createResponse();

    await getCurrentUser(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });
});
