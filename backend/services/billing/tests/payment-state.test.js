import test from "node:test";
import assert from "node:assert/strict";
import {
  canExpireCheckout,
  hasOnlyFailedAttempts,
  hasUnresolvedAttempts,
} from "../services/payment-state.js";

test("an empty payment list is not proof of failed attempts", () => {
  assert.equal(hasOnlyFailedAttempts([]), false);
  assert.equal(canExpireCheckout([]), true);
});

test("only all-failed attempts count as definitively failed", () => {
  assert.equal(hasOnlyFailedAttempts([{ status: "failed" }, { status: "failed" }]), true);
  assert.equal(hasOnlyFailedAttempts([{ status: "failed" }, { status: "captured" }]), false);
});

test("created and authorized attempts remain unresolved", () => {
  for (const status of ["created", "authorized"]) {
    const payments = [{ status }];
    assert.equal(hasUnresolvedAttempts(payments), true);
    assert.equal(canExpireCheckout(payments), false);
  }
});

test("a late captured attempt is never expired as a failed payment", () => {
  const payments = [{ status: "captured" }];
  assert.equal(canExpireCheckout(payments), false);
});
