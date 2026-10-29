import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import Interview from "../models/interview.model.js";

test("one active interview per user is enforced by a unique partial index", () => {
  const activeIndex = Interview.schema
    .indexes()
    .find(
      ([keys, options]) =>
        keys.userId === 1 &&
        options.unique === true &&
        options.partialFilterExpression?.status?.$in?.includes("in-progress") &&
        options.partialFilterExpression?.status?.$in?.includes("created"),
    );

  assert.ok(activeIndex);
});

test("JSON serialization hides finalization lock internals", () => {
  const interview = new Interview({
    userId: new mongoose.Types.ObjectId(),
    role: "Software Engineer",
    experienceLevel: "fresher",
    interviewLevel: "sde-1",
    interviewType: "coding",
    finalizationKey: "private-lock-key",
    finalizationStartedAt: new Date(),
    finalizationLeaseUntil: new Date(Date.now() + 60000),
  });

  const json = interview.toJSON();
  assert.equal(Object.hasOwn(json, "finalizationKey"), false);
  assert.equal(Object.hasOwn(json, "finalizationStartedAt"), false);
  assert.equal(Object.hasOwn(json, "finalizationLeaseUntil"), false);
  assert.equal(Object.hasOwn(json, "__v"), false);
});

test("dismissed timeout notices remain stored and answer length is bounded", () => {
  assert.equal(
    Interview.schema.path("terminationNoticeDismissed").defaultValue,
    false,
  );
  assert.equal(
    Interview.schema.path("questions").schema.path("answer").options.maxlength,
    20000,
  );
});
