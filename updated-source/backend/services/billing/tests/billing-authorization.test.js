import test from "node:test";
import assert from "node:assert/strict";
import gatewayAuthMiddleware from "../middlewares/gateway-auth.middleware.js";

const runMiddleware = (headers = {}) => {
  const req = {
    get: (name) => headers[name.toLowerCase()],
  };
  let forwardedError;
  let nextCalled = false;
  gatewayAuthMiddleware(req, {}, (error) => {
    forwardedError = error;
    nextCalled = !error;
  });
  return { req, forwardedError, nextCalled };
};

test("billing internal auth fails closed when secret is not configured", () => {
  const previous = process.env.BILLING_INTERNAL_SECRET;
  delete process.env.BILLING_INTERNAL_SECRET;
  try {
    const result = runMiddleware({ "x-internal-service-secret": "secret", "x-user-id": "0123456789abcdef01234567" });
    assert.equal(result.nextCalled, false);
    assert.equal(result.forwardedError.code, "BILLING_AUTH_CONFIGURATION_ERROR");
  } finally {
    if (previous === undefined) delete process.env.BILLING_INTERNAL_SECRET;
    else process.env.BILLING_INTERNAL_SECRET = previous;
  }
});

test("billing internal auth rejects an incorrect service secret", () => {
  const previous = process.env.BILLING_INTERNAL_SECRET;
  process.env.BILLING_INTERNAL_SECRET = "expected-secret";
  try {
    const result = runMiddleware({ "x-internal-service-secret": "wrong-secret", "x-user-id": "0123456789abcdef01234567" });
    assert.equal(result.nextCalled, false);
    assert.equal(result.forwardedError.code, "INTERNAL_AUTH_FAILED");
  } finally {
    if (previous === undefined) delete process.env.BILLING_INTERNAL_SECRET;
    else process.env.BILLING_INTERNAL_SECRET = previous;
  }
});

test("billing internal auth accepts a valid secret and object ID", () => {
  const previous = process.env.BILLING_INTERNAL_SECRET;
  process.env.BILLING_INTERNAL_SECRET = "expected-secret";
  try {
    const result = runMiddleware({ "x-internal-service-secret": "expected-secret", "x-user-id": "0123456789abcdef01234567" });
    assert.equal(result.nextCalled, true);
    assert.equal(result.req.internalUserId, "0123456789abcdef01234567");
  } finally {
    if (previous === undefined) delete process.env.BILLING_INTERNAL_SECRET;
    else process.env.BILLING_INTERNAL_SECRET = previous;
  }
});
