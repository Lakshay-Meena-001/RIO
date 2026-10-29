import test from "node:test";
import assert from "node:assert/strict";
import internalAuth from "../middlewares/internalAuth.js";

const validUserId = "507f1f77bcf86cd799439011";

const createResponse = () => ({
  statusCode: 200,
  body: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  },
});

test("internal auth fails closed when the secret is missing", () => {
  const original = process.env.RESUME_INTERNAL_SECRET;
  delete process.env.RESUME_INTERNAL_SECRET;
  const req = { headers: { "x-user-id": validUserId } };
  const res = createResponse();
  let calledNext = false;

  internalAuth(req, res, () => {
    calledNext = true;
  });

  assert.equal(res.statusCode, 401);
  assert.equal(calledNext, false);
  if (original !== undefined) process.env.RESUME_INTERNAL_SECRET = original;
});

test("internal auth rejects an incorrect secret", () => {
  const original = process.env.RESUME_INTERNAL_SECRET;
  process.env.RESUME_INTERNAL_SECRET = "expected-secret";
  const req = {
    headers: {
      "x-user-id": validUserId,
      "x-internal-service-secret": "wrong-secret",
    },
  };
  const res = createResponse();
  let calledNext = false;

  internalAuth(req, res, () => {
    calledNext = true;
  });

  assert.equal(res.statusCode, 401);
  assert.equal(calledNext, false);
  if (original === undefined) delete process.env.RESUME_INTERNAL_SECRET;
  else process.env.RESUME_INTERNAL_SECRET = original;
});

test("internal auth accepts a valid secret and MongoDB user ID", () => {
  const original = process.env.RESUME_INTERNAL_SECRET;
  process.env.RESUME_INTERNAL_SECRET = "expected-secret";
  const req = {
    headers: {
      "x-user-id": validUserId,
      "x-internal-service-secret": "expected-secret",
    },
  };
  const res = createResponse();
  let calledNext = false;

  internalAuth(req, res, () => {
    calledNext = true;
  });

  assert.equal(calledNext, true);
  assert.equal(req.internalUserId, validUserId);
  if (original === undefined) delete process.env.RESUME_INTERNAL_SECRET;
  else process.env.RESUME_INTERNAL_SECRET = original;
});

test("internal auth rejects malformed user IDs", () => {
  const original = process.env.RESUME_INTERNAL_SECRET;
  process.env.RESUME_INTERNAL_SECRET = "expected-secret";
  const req = {
    headers: {
      "x-user-id": "not-an-object-id",
      "x-internal-service-secret": "expected-secret",
    },
  };
  const res = createResponse();
  let calledNext = false;

  internalAuth(req, res, () => {
    calledNext = true;
  });

  assert.equal(res.statusCode, 401);
  assert.equal(calledNext, false);
  if (original === undefined) delete process.env.RESUME_INTERNAL_SECRET;
  else process.env.RESUME_INTERNAL_SECRET = original;
});
