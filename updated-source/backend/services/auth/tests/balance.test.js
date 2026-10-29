import { describe, it, expect, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  smembers: vi.fn(),
  set: vi.fn(),
  expire: vi.fn(),
  findById: vi.fn(),
  findOne: vi.fn(),
  findOneAndUpdate: vi.fn(),
  create: vi.fn(),
  startSession: vi.fn(),
  withTransaction: vi.fn(),
  endSession: vi.fn(),
}));

vi.mock("../../../shared/redis/redis.js", () => ({
  default: {
    get: mocks.get,
    smembers: mocks.smembers,
    set: mocks.set,
    expire: mocks.expire,
  },
}));

vi.mock("../models/user.model.js", () => ({
  default: {
    findById: mocks.findById,
    findOneAndUpdate: mocks.findOneAndUpdate,
  },
}));

vi.mock("../models/balance-transaction.model.js", () => ({
  default: {
    findOne: mocks.findOne,
    create: mocks.create,
  },
}));

vi.mock("mongoose", () => ({
  default: {
    startSession: mocks.startSession,
  },
}));

vi.mock("firebase-admin/auth", () => ({
  getAuth: vi.fn(),
}));

vi.mock("../config/firebase.js", () => ({
  app: {},
}));

import { useBalance } from "../controllers/auth.controller.js";

const makeResponse = () => {
  const res = {};

  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);

  return res;
};

const makeQuery = (value) => ({
  select: vi.fn().mockReturnThis(),
  session: vi.fn().mockResolvedValue(value),
});

describe("useBalance controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.get.mockResolvedValue(JSON.stringify({ userId: "user-123" }));

    mocks.findOne.mockReturnValue(makeQuery(null));

    mocks.startSession.mockResolvedValue({
      withTransaction: async (callback) => callback(),
      endSession: mocks.endSession,
    });

    mocks.smembers.mockResolvedValue([]);
    mocks.set.mockResolvedValue("OK");
    mocks.expire.mockResolvedValue(1);
  });

  it("should reject a request without a session", async () => {
    mocks.get.mockResolvedValue(null);

    const req = {
      cookies: { session: "session-123" },
      body: { transactionId: "tx-1", amount: 100 },
    };

    const res = makeResponse();

    await useBalance(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false }),
    );
  });

  it("should reject a zero amount", async () => {
    const req = {
      cookies: { session: "session-123" },
      body: { transactionId: "tx-1", amount: 0 },
    };

    const res = makeResponse();

    await useBalance(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mocks.startSession).not.toHaveBeenCalled();
  });

  it("should reject a missing transaction ID", async () => {
    const req = {
      cookies: { session: "session-123" },
      body: { amount: 100 },
    };

    const res = makeResponse();

    await useBalance(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mocks.startSession).not.toHaveBeenCalled();
  });

  it("should return 409 when a transaction ID is reused with different details", async () => {
    mocks.findOne.mockReturnValue(
      makeQuery({
        amount: 50,
        action: "purchase",
        balanceAfter: 1450,
      }),
    );

    const req = {
      cookies: { session: "session-123" },
      body: {
        transactionId: "tx-1",
        amount: 100,
        action: "purchase",
      },
    };

    const res = makeResponse();

    await useBalance(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(mocks.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it("should deduct balance successfully", async () => {
    const currentUser = { balance: 1500 };

    const updatedUser = {
      _id: { toString: () => "user-123" },
      name: "Test User",
      email: "test@example.com",
      phoneNumber: "",
      balance: 1400,
      profileCompleted: true,
    };

    mocks.findById
      .mockReturnValueOnce(makeQuery(currentUser))
      .mockResolvedValueOnce(updatedUser);

    mocks.findOneAndUpdate.mockResolvedValue(updatedUser);
    mocks.create.mockResolvedValue([{}]);

    const req = {
      cookies: { session: "session-123" },
      body: {
        transactionId: "tx-success",
        amount: 100,
        action: "purchase",
      },
    };

    const res = makeResponse();

    await useBalance(req, res);

    expect(mocks.findOneAndUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        _id: "user-123",
        balance: { $gte: 100 },
      }),
      { $inc: { balance: -100 } },
      expect.objectContaining({
        new: true,
        runValidators: true,
      }),
    );

    expect(mocks.create).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        balance: 1400,
      }),
    );
  });

  it("should reject deduction when balance is insufficient", async () => {
    mocks.findById.mockReturnValueOnce(makeQuery({ balance: 50 }));

    mocks.findOneAndUpdate.mockResolvedValue(null);

    const req = {
      cookies: { session: "session-123" },
      body: {
        transactionId: "tx-insufficient",
        amount: 100,
        action: "purchase",
      },
    };

    const res = makeResponse();

    await useBalance(req, res);

    expect(mocks.findOneAndUpdate).toHaveBeenCalled();
    expect(mocks.create).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Insufficient balance.",
        balance: 50,
      }),
    );
  });

  it("should not deduct balance again for an already processed transaction", async () => {
    mocks.findOne.mockReturnValueOnce(
      makeQuery({
        amount: 100,
        action: "purchase",
        balanceAfter: 1400,
      }),
    );

    mocks.findById.mockReturnValueOnce(makeQuery({ balance: 1200 }));

    const req = {
      cookies: { session: "session-123" },
      body: {
        transactionId: "tx-duplicate",
        amount: 100,
        action: "purchase",
      },
    };

    const res = makeResponse();

    await useBalance(req, res);

    expect(mocks.findOneAndUpdate).not.toHaveBeenCalled();
    expect(mocks.create).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        balance: 1400,
        alreadyProcessed: true,
      }),
    );
  });

  it("should reject a reused transaction ID with a different amount", async () => {
    mocks.findOne.mockReturnValueOnce(
      makeQuery({
        amount: 50,
        action: "purchase",
        balanceAfter: 1450,
      }),
    );

    const req = {
      cookies: { session: "session-123" },
      body: {
        transactionId: "tx-conflict",
        amount: 100,
        action: "purchase",
      },
    };

    const res = makeResponse();

    await useBalance(req, res);

    expect(mocks.findOneAndUpdate).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(409);
  });
});
