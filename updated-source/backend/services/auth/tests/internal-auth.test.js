import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("mongoose", () => ({
  default: {
    isObjectIdOrHexString: vi.fn(
      (value) => typeof value === "string" && /^[a-f\d]{24}$/i.test(value),
    ),
  },
}));

import { internalAuthMiddleware } from "../middleware/internal-auth.middleware.js";

const createResponse = () => {
  const res = {
    status: vi.fn(),
    json: vi.fn(),
  };

  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);

  return res;
};

describe("Internal auth middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.AUTH_INTERNAL_SECRET = "test-internal-secret";
  });

  it("should return 503 when the internal secret is not configured", () => {
    delete process.env.AUTH_INTERNAL_SECRET;

    const req = { get: vi.fn() };
    const res = createResponse();
    const next = vi.fn();

    internalAuthMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(next).not.toHaveBeenCalled();
  });

  it("should reject a missing secret with 401", () => {
    const req = { get: vi.fn(() => undefined) };
    const res = createResponse();
    const next = vi.fn();

    internalAuthMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("should reject an incorrect secret with 401", () => {
    const req = {
      get: vi.fn((header) =>
        header === "x-internal-service-secret"
          ? "wrong-secret"
          : "507f1f77bcf86cd799439011",
      ),
    };
    const res = createResponse();
    const next = vi.fn();

    internalAuthMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("should reject an invalid user ID with 400", () => {
    const req = {
      get: vi.fn((header) =>
        header === "x-internal-service-secret"
          ? "test-internal-secret"
          : "invalid-id",
      ),
    };
    const res = createResponse();
    const next = vi.fn();

    internalAuthMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it("should accept a valid secret and user ID", () => {
    const userId = "507f1f77bcf86cd799439011";
    const req = {
      get: vi.fn((header) =>
        header === "x-internal-service-secret"
          ? "test-internal-secret"
          : userId,
      ),
    };
    const res = createResponse();
    const next = vi.fn();

    internalAuthMiddleware(req, res, next);

    expect(req.internalUserId).toBe(userId);
    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });
});
