import test from "node:test";
import assert from "node:assert/strict";
import { errorHandler } from "../middlewares/errorHandler.js";

function makeResponse() {
  return {
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
  };
}

test("payload-too-large errors return 413 with a safe message", () => {
  const response = makeResponse();
  errorHandler(
    { type: "entity.too.large", status: 413 },
    {},
    response,
    () => {},
  );
  assert.equal(response.statusCode, 413);
  assert.equal(response.body.code, "PAYLOAD_TOO_LARGE");
  assert.equal(response.body.message, "Request body is too large.");
});

test("known client errors preserve their status and message", () => {
  const response = makeResponse();
  errorHandler(
    { statusCode: 409, message: "Already finalizing." },
    {},
    response,
    () => {},
  );
  assert.equal(response.statusCode, 409);
  assert.equal(response.body.message, "Already finalizing.");
});

test("unknown server errors are returned without leaking internal details", () => {
  const response = makeResponse();
  const originalError = console.error;
  console.error = () => {};

  try {
    errorHandler(
      { message: "database password details" },
      {},
      response,
      () => {},
    );
  } finally {
    console.error = originalError;
  }

  assert.equal(response.statusCode, 500);
  assert.equal(response.body.message, "Internal server error.");
});
