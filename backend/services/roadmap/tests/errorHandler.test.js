import test from "node:test";
import assert from "node:assert/strict";
import { errorHandler, notFoundHandler } from "../middlewares/errorHandler.js";

function responseMock() {
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

test("oversized JSON requests return 413 without internal details", () => {
  const res = responseMock();
  errorHandler(
    { type: "entity.too.large", message: "private detail" },
    { method: "POST", originalUrl: "/api/roadmaps" },
    res,
    () => {},
  );
  assert.equal(res.statusCode, 413);
  assert.equal(res.body.message, "Request body is too large.");
  assert.equal(JSON.stringify(res.body).includes("private detail"), false);
});

test("malformed JSON returns a safe 400 response", () => {
  const res = responseMock();
  errorHandler(
    { type: "entity.parse.failed", message: "private detail" },
    { method: "POST", originalUrl: "/api/roadmaps" },
    res,
    () => {},
  );
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.message, "Request body contains invalid JSON.");
});

test("duplicate key errors map to conflict", () => {
  const res = responseMock();
  errorHandler(
    { code: 11000, message: "duplicate secret" },
    { method: "POST", originalUrl: "/api/roadmaps" },
    res,
    () => {},
  );
  assert.equal(res.statusCode, 409);
  assert.equal(res.body.message, "The request conflicts with existing data.");
});

test("unknown routes return 404", () => {
  const res = responseMock();
  notFoundHandler({ method: "GET", originalUrl: "/missing" }, res);
  assert.equal(res.statusCode, 404);
  assert.equal(res.body.code, "ROUTE_NOT_FOUND");
});
