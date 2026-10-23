import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import Resume from "../models/resume.model.js";

test("resume model has a unique sparse idempotency index for race-safe uploads", () => {
  const idempotencyIndex = Resume.schema
    .indexes()
    .find(
      ([keys, options]) =>
        keys.idempotencyKey === 1 &&
        options.unique === true &&
        options.sparse === true,
    );

  assert.ok(
    idempotencyIndex,
    "unique sparse idempotency index should be configured",
  );
});

test("resume API serialization does not expose internal idempotency or lock fields", () => {
  const resume = new Resume({
    userId: new mongoose.Types.ObjectId(),
    extractedText: "Resume content",
    idempotencyKey: "internal-idempotency-key",
    processing: {
      status: "processing",
      lockToken: "internal-lock-token",
      lockExpiresAt: new Date(Date.now() + 10000),
    },
  });

  const json = resume.toJSON();
  assert.equal(Object.hasOwn(json, "idempotencyKey"), false);
  assert.equal(Object.hasOwn(json.processing, "lockToken"), false);
  assert.equal(Object.hasOwn(json.processing, "lockExpiresAt"), false);
});
